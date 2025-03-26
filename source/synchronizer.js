import {
  VALUE_TYPE__FUNCTION,
  VALUE_TYPE__PLAIN_OBJECT,
  VALUE_TYPE__PRIMITIVE,
  WORKER_ACTION__APPLY,
  WORKER_ACTION__GET,
  WORKER_ACTION__GET_INFORMATION,
  WORKER_ACTION__OWN_KEYS,
} from './constants.js'
import normalizeModule from './normalize-module.js'
import {hashPath, normalizePath} from './property-path.js'
import ThreadsWorker from './threads-worker.js'

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

  static create(module, {isNormalizedModule = false} = {}) {
    module = isNormalizedModule ? module : normalizeModule(module)

    return cacheResult(
      this.#instances,
      JSON.stringify(module),
      () => new Synchronizer(module),
    )
  }

  #worker

  #synchronizedFunctionStore = new Map()

  #informationStore = new Map()

  #ownKeysStore = new Map()

  #plainObjectStore = new Map()

  constructor(module) {
    this.#worker = new ThreadsWorker(module)
  }

  getInformation(path) {
    return cachePathResult(this.#informationStore, path, () =>
      this.#worker.sendAction(WORKER_ACTION__GET_INFORMATION, {path}),
    )
  }

  setKnownInformation(path, information) {
    this.#informationStore.set(hashPath(path), information)
  }

  get(path) {
    const information = this.getInformation(path)
    switch (information.type) {
      case VALUE_TYPE__FUNCTION:
        return this.#createSynchronizedFunction(path)
      case VALUE_TYPE__PRIMITIVE:
        return information.value
      case VALUE_TYPE__PLAIN_OBJECT:
        return this.#createPlainObjectProxy(path, information)
      default:
        return this.#worker.sendAction(WORKER_ACTION__GET, {path})
    }
  }

  ownKeys(path) {
    return cachePathResult(this.#ownKeysStore, path, () =>
      this.#worker.sendAction(WORKER_ACTION__OWN_KEYS, {path}),
    )
  }

  apply(path, argumentsList) {
    return this.#worker.sendAction(WORKER_ACTION__APPLY, {path, argumentsList})
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
        if (propertyInformation?.type === VALUE_TYPE__PRIMITIVE) {
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
