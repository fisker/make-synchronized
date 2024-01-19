import {
  VALUE_TYPE_FUNCTION,
  WORKER_ACTION_CALL,
  WORKER_ACTION_GET,
  WORKER_ACTION_GET_MODULE_SPECIFIERS,
} from './constants.js'
import createWorker from './create-worker.js'
import callWorker from './call-worker.js'
import toModuleId from './to-module-id.js'

class Synchronizer {
  #worker

  #moduleId

  #specifiers

  #specifierFunctions = new Map()

  constructor({module}) {
    this.#worker = createWorker()
    this.#moduleId = toModuleId(module)
  }

  getModuleSpecifiers() {
    this.#specifiers ??= callWorker(
      this.#worker,
      WORKER_ACTION_GET_MODULE_SPECIFIERS,
      {
        moduleId: this.#moduleId,
      },
    )

    return this.#specifiers
  }

  getDefaultExportFunction() {
    return this.getModuleSpecifiers().default?.type === VALUE_TYPE_FUNCTION
      ? this.createSynchronizedFunction()
      : this.getSpecifier('default')
  }

  createSynchronizedFunction(specifier = 'default') {
    const functions = this.#specifierFunctions

    if (!functions.has(specifier)) {
      functions.set(specifier, (...argumentsList) =>
        callWorker(this.#worker, WORKER_ACTION_CALL, {
          moduleId: this.#moduleId,
          specifier,
          argumentsList,
        }),
      )
    }

    return functions.get(specifier)
  }

  getSpecifier(property) {
    return callWorker(this.#worker, WORKER_ACTION_GET, {
      moduleId: this.#moduleId,
      property,
    })
  }

  createGetter(property) {
    return () => this.getSpecifier(property)
  }

  createDefaultExportFunctionProxy() {
    const defaultExportFunction = this.getDefaultExportFunction()

    return new Proxy(defaultExportFunction, {
      apply: (target, thisArgument, argumentsList) =>
        Reflect.apply(target, thisArgument, argumentsList),
      get: (target, property /* , receiver */) => {
        const specifier = this.getModuleSpecifiers()[property]

        if (!specifier) {
          return
        }

        if (specifier.type === VALUE_TYPE_FUNCTION) {
          return this.createSynchronizedFunction(property)
        }

        return this.getSpecifier(property)
      },
    })
  }

  createModule() {
    const module = Object.create(null, {
      [Symbol.toStringTag]: {value: 'Module', enumerable: false},
    })
    const specifiers = this.getModuleSpecifiers()

    return Object.defineProperties(
      module,
      Object.fromEntries(
        Object.values(specifiers).map(({name, type}) => {
          const descriptor = {enumerable: true}
          if (type === VALUE_TYPE_FUNCTION) {
            descriptor.value = this.createSynchronizedFunction(name)
          } else {
            descriptor.get = this.createGetter(name)
          }

          return [name, descriptor]
        }),
      ),
    )
  }
}

export default Synchronizer
