import {VALUE_TYPE_FUNCTION} from './constants.js'
import Synchronizer from './synchronizer.js'

function makeDefaultExportSynchronized(module) {
  return Synchronizer.create({module}).get('default')
}

function makeModuleSynchronized(module) {
  return Synchronizer.create({module}).createModule()
}

function makeSynchronized(moduleOrFunction) {
  const synchronizer = Synchronizer.create({module: moduleOrFunction})
  const defaultExportType = synchronizer.getInformation('default').type

  if (defaultExportType === VALUE_TYPE_FUNCTION) {
    return synchronizer.createDefaultExportFunctionProxy()
  }

  return synchronizer.createModule()
}

export default makeSynchronized
export {makeSynchronized, makeDefaultExportSynchronized, makeModuleSynchronized}
