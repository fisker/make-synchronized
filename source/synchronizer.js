import {
  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_PRIMITIVE,
  VALUE_TYPE_PLAIN_OBJECT,
  WORKER_ACTION_APPLY,
  WORKER_ACTION_GET,
  WORKER_ACTION_OWN_KEYS,
  WORKER_ACTION_GET_INFORMATION,
} from './constants.js'
import toModuleId from './to-module-id.js'
import {normalizePath, hashPath} from './property-path.js'
import ThreadsWorker from './threads-worker.js'

/**
@typedef {import('./types.ts').Module} Module
@typedef {import('./types.ts').SynchronizedDefaultExportProxy} SynchronizedDefaultExportProxy
@typedef {import('./types.ts').SynchronizedModule} SynchronizedModule
*/

const cacheResult = (cache, cacheKey, getResult) => {
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, getResult())
  }

  return cache.get(cacheKey)
}

const cachePathResult = (cache, path, getResult) =>
  cacheResult(cache, hashPath(path), getResult)

class Synchronizer {
  static #instances = new Map()

  /**
   @param {{module: Module}} param0
   @returns {Synchronizer}
   */
  static create({module}) {
    const moduleId = toModuleId(module)

    return cacheResult(
      this.#instances,
      moduleId,
      () => new Synchronizer(moduleId),
    )
  }

  #worker

  #synchronizedFunctionStore = new Map()

  #informationStore = new Map()

  #ownKeysStore = new Map()

  #plainObjectStore = new Map()

  constructor(moduleId) {
    this.#worker = new ThreadsWorker({moduleId})
  }

  getInformation(path) {
    return cachePathResult(this.#informationStore, path, () =>
      this.#worker.sendAction(WORKER_ACTION_GET_INFORMATION, {path}),
    )
  }

  get(path) {
    const information = this.getInformation(path)
    switch (information.type) {
      case VALUE_TYPE_FUNCTION:
        return this.#createSynchronizedFunction(path)
      case VALUE_TYPE_PRIMITIVE:
        return information.value
      case VALUE_TYPE_PLAIN_OBJECT:
        return this.#createPlainObjectProxy(path, information)
      default:
        return this.#worker.sendAction(WORKER_ACTION_GET, {path})
    }
  }

  ownKeys(path) {
    return cachePathResult(this.#ownKeysStore, path, () =>
      this.#worker.sendAction(WORKER_ACTION_OWN_KEYS, {path}),
    )
  }

  apply(path, argumentsList) {
    return this.#worker.sendAction(WORKER_ACTION_APPLY, {path, argumentsList})
  }

  #createSynchronizedFunction(path) {
    return cachePathResult(
      this.#synchronizedFunctionStore,
      path,
      () =>
        (...argumentsList) =>
          this.apply(path, argumentsList),
    )
  }

  /** @return {SynchronizedDefaultExportProxy} */
  createDefaultExportFunctionProxy() {
    const defaultExportFunction = this.get('default')

    return new Proxy(defaultExportFunction, {
      get: (target, property /* , receiver */) => this.get(property),
    })
  }

  #createPlainObjectProxy(path, {isNullPrototypeObject, properties}) {
    path = normalizePath(path)

    return cachePathResult(this.#plainObjectStore, path, () => {
      const object = isNullPrototypeObject ? Object.create(null) : {}

      for (const [property, propertyInformation] of properties) {
        if (propertyInformation?.type === VALUE_TYPE_PRIMITIVE) {
          object[property] = propertyInformation.value
        } else {
          Object.defineProperty(object, property, {
            get: () => this.get([...path, property]),
            enumerable: true,
            configurable: true,
          })
        }
      }

      return new Proxy(object, {
        get: (target, property, receiver) => {
          // Allow well-known symbols?
          if (typeof property === 'symbol' || properties.has(property)) {
            return Reflect.get(target, property, receiver)
          }

          return this.get([...path, property])
        },
      })
    })
  }

  /** @return {SynchronizedModule} */
  createModule() {
    const module = Object.create(null, {
      [Symbol.toStringTag]: {value: 'Module', enumerable: false},
    })
    const specifiers = this.ownKeys()

    return Object.defineProperties(
      module,
      Object.fromEntries(
        specifiers.map((specifier) => [
          specifier,
          {
            get: () => this.get(specifier),
            enumerable: true,
          },
        ]),
      ),
    )
  }
}

export default Synchronizer
