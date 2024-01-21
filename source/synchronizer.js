import {
  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_PRIMITIVE,
  WORKER_ACTION_CALL,
  WORKER_ACTION_GET,
  WORKER_ACTION_OWN_KEYS,
  WORKER_ACTION_GET_PATH_INFORMATION,
} from './constants.js'
import callWorker from './call-worker.js'
import toModuleId from './to-module-id.js'
import {hashPath} from './property-path.js'

const cacheResult = (cache, path, getResult) => {
  const cacheKey = hashPath(path)

  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, getResult())
  }

  return cache.get(cacheKey)
}

class Synchronizer {
  static #instances = new Map()

  static create({module}) {
    const moduleId = toModuleId(module)
    const instances = this.#instances

    if (!instances.has(moduleId)) {
      instances.set(moduleId, new Synchronizer(moduleId))
    }

    return instances.get(moduleId)
  }

  #moduleId

  #synchronizedFunctionStore = new Map()

  #pathInformationStore = new Map()

  #pathOwnKeysStore = new Map()

  constructor(moduleId) {
    this.#moduleId = moduleId
  }

  #callWorker(action, path, payload) {
    return callWorker(action, this.#moduleId, path, payload)
  }

  getModulePathInformation(path) {
    return cacheResult(this.#pathInformationStore, path, () =>
      this.#callWorker(WORKER_ACTION_GET_PATH_INFORMATION, path),
    )
  }

  getModulePathValue(path) {
    const information = this.getModulePathInformation(path)
    switch (information.type) {
      case VALUE_TYPE_FUNCTION:
        return this.#createSynchronizedFunction(path)
      case VALUE_TYPE_PRIMITIVE:
        return information.value
      default:
        return this.#callWorker(WORKER_ACTION_GET, path)
    }
  }

  getModulePathOwnKeys(path) {
    return cacheResult(this.#pathOwnKeysStore, path, () =>
      this.#callWorker(WORKER_ACTION_OWN_KEYS, path),
    )
  }

  callModulePathFunction(path, argumentsList) {
    return this.#callWorker(WORKER_ACTION_CALL, path, {argumentsList})
  }

  #createSynchronizedFunction(path) {
    return cacheResult(
      this.#synchronizedFunctionStore,
      path,
      () =>
        (...argumentsList) =>
          this.callModulePathFunction(path, argumentsList),
    )
  }

  createDefaultExportFunctionProxy() {
    const defaultExportFunction = this.getModulePathValue('default')

    return new Proxy(defaultExportFunction, {
      apply: (target, thisArgument, argumentsList) =>
        Reflect.apply(target, thisArgument, argumentsList),
      get: (target, property /* , receiver */) =>
        this.getModulePathValue(property),
    })
  }

  createModule() {
    const module = Object.create(null, {
      [Symbol.toStringTag]: {value: 'Module', enumerable: false},
    })
    const specifiers = this.getModulePathOwnKeys()

    return Object.defineProperties(
      module,
      Object.fromEntries(
        specifiers.map((specifier) => [
          specifier,
          {
            get: () => this.getModulePathValue(specifier),
            enumerable: true,
          },
        ]),
      ),
    )
  }
}

export default Synchronizer
