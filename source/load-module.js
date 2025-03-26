import {workerData} from 'node:worker_threads'

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

  moduleImportPromise ??= import(workerData.moduleId)

  try {
    moduleInstance = await moduleImportPromise
  } catch (error) {
    moduleLoadError = error
    throw error
  }

  return moduleImportPromise
}

// Unknown reason, can't throw on worker start
const initModule = async () => {
  try {
    moduleInstance = await import(workerData.moduleId)
  } catch (error) {
    moduleLoadError = error
  }
}

export default loadModule
export {initModule}
