import {workerData} from 'node:worker_threads'
import {MODULE_TYPE__INLINE_FUNCTION} from './constants.js'

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
  const {module} = workerData

  if (module.type === MODULE_TYPE__INLINE_FUNCTION) {
    const {code} = module

    try {
      // eslint-disable-next-line sonarjs/code-eval, no-eval
      moduleInstance = {default: eval(code)}
    } catch (error) {
      moduleLoadError = error
    }

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
