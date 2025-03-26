import {workerData} from 'node:worker_threads'
import {GLOBAL_SERVER_PROPERTY, IS_PRODUCTION} from './constants.js'

let moduleImportPromise
let moduleInstance
let moduleLoadError

async function loadModule() {
  if (moduleInstance) {
    return moduleInstance
  }

  if (moduleLoadError) {
    throw moduleLoadError
  }

  try {
    moduleInstance = await moduleImportPromise
  } catch (error) {
    moduleLoadError = error
    throw error
  }

  return moduleImportPromise
}

// Unknown reason, can't throw on worker start
const initializeModule = async () => {
  if (workerData.exposeSetModuleInstance) {
    // Expose for the main threat to call
    Object.defineProperty(globalThis, GLOBAL_SERVER_PROPERTY, {
      enumerable: false,
      configurable: true,
      writable: false,
      value: {
        setModuleInstance(module) {
          delete globalThis[GLOBAL_SERVER_PROPERTY]

          if (
            !IS_PRODUCTION &&
            Object.getOwnPropertyDescriptor(
              globalThis,
              GLOBAL_SERVER_PROPERTY,
            ) !== undefined
          ) {
            throw new Error('Unexpected error.')
          }

          moduleInstance = module
        },
      },
    })

    return
  }

  moduleImportPromise = import(workerData.module.source)

  try {
    moduleInstance = await moduleImportPromise
  } catch (error) {
    moduleLoadError = error
  }
}

export default loadModule
export {initializeModule}
