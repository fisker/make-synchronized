import {
  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_PRIMITIVE,
  VALUE_TYPE_ARRAY,
  VALUE_TYPE_SYMBOL,
  WORKER_ACTION_APPLY,
  WORKER_ACTION_GET,
  WORKER_ACTION_OWN_KEYS,
  WORKER_ACTION_GET_INFORMATION,
} from './constants.js'
import toModuleId from './to-module-id.js'
import {normalizePath, hashPath} from './property-path.js'
import ThreadWorker from './threads-worker.js'

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

  constructor(moduleId) {
    this.#worker = new ThreadWorker({moduleId})
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
      // Option to proxy array?
      case VALUE_TYPE_SYMBOL:
      case VALUE_TYPE_ARRAY:
        return this.#worker.sendAction(WORKER_ACTION_GET, {path})
      default:
        return this.createObjectProxy(
          this.#worker.sendAction(WORKER_ACTION_GET, {path}),
          path,
        )
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

  createDefaultExportFunctionProxy() {
    const defaultExportFunction = this.get('default')

    return new Proxy(defaultExportFunction, {
      get: (target, property /* , receiver */) => this.get(property),
    })
  }

  createObjectProxy(value, path) {
    path = normalizePath(path)

    return new Proxy(value, {
      get: (target, property, receiver) => {
        // Allow well-known symbols?
        if (typeof property === 'symbol') {
          return Reflect.get(target, property, receiver)
        }

        return this.get([...path, property])
      },
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
