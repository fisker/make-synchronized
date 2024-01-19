import {
  CALL,
  GET,
  GET_MODULE_SPECIFIERS,
} from '../constants.js'
import createWorker from './create-worker.js'
import callWorker from './call-worker.js'
import toModuleId from './to-module-id.js'

class Synchronizer {
  #worker
  #moduleId

  constructor({module}) {
    this.#worker = createWorker()
    this.#moduleId = toModuleId(module)
  }

  getModuleSpecifiers() {
    return callWorker(
      this.#worker,
      GET_MODULE_SPECIFIERS,
      {
        moduleId: this.#moduleId,
      }
    )
  }

  createSynchronizedFunction(specifier) {
    return (...argumentsList) => {
      return callWorker(
        this.#worker,
        CALL,
        {
          moduleId: this.#moduleId,
          specifier,
          argumentsList,
        },
      )
    }
  }

  createGetter(property) {
    return () => {
      return callWorker(
        this.#worker,
        GET, 
        {
          moduleId: this.#moduleId,
          property,
        },
      )
    }
  }
}

export default Synchronizer