import {VALUE_TYPE_FUNCTION} from './utilities/constants.js'
import functionToModule from './utilities/function-to-module.js'
import Synchronizer from './utilities/synchronizer.js'

function makeSynchronizedDefaultExport(module) {
  return Synchronizer.create({module}).getModulePathValue('default')
}

function makeSynchronizedFunction(function_) {
  return makeSynchronizedDefaultExport(functionToModule(function_))
}

function makeSynchronizedModule(module) {
  return Synchronizer.create({module}).createModule()
}

function makeSynchronized(moduleOrFunction) {
  if (typeof moduleOrFunction === 'function') {
    return makeSynchronizedFunction(moduleOrFunction)
  }

  const synchronizer = Synchronizer.create({module: moduleOrFunction})
  const defaultExportType =
    synchronizer.getModulePathInformation('default').type

  if (defaultExportType === VALUE_TYPE_FUNCTION) {
    return synchronizer.createDefaultExportFunctionProxy()
  }

  return synchronizer.createModule()
}

export default makeSynchronized
export {
  makeSynchronized,
  makeSynchronizedDefaultExport,
  makeSynchronizedFunction,
  makeSynchronizedModule,
}
