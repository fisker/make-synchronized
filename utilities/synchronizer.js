import {
  CALL,
  GET,
  GET_MODULE_SPECIFIERS,
} from '../constants.js'
import createWorker from './create-worker.js'
import callWorker from './call-worker.js'

class Synchronizer {
  #worker
  #url

  constructor({module}) {
    this.#worker = createWorker()
    this.#url = module instanceof URL ? module.href : module
  }

  getModuleSpecifiers() {
    return callWorker(
      this.#worker,
      GET_MODULE_SPECIFIERS,
      {
        url: this.#url,
      }
    )
  }

  createSynchronizedFunction(specifier) {
    return (...argumentsList) => {
      return callWorker(
        this.#worker,
        CALL,
        {
          url: this.#url,
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
          url: this.#url,
          property,
        },
      )
    }
  }
}

export default Synchronizer