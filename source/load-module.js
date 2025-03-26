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

export default loadModule
