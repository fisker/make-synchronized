import {VALUE_TYPE_FUNCTION} from './constants.js'
import functionToModule from './function-to-module.js'
import Synchronizer from './synchronizer.js'

function makeSynchronizedDefaultExport(module) {
  return Synchronizer.create({module}).get('default')
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
  const defaultExportType = synchronizer.getInformation('default').type

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
