import {VALUE_TYPE__FUNCTION} from './constants.js'
import {
  makeSynchronizedFunction,
  makeSynchronizedFunctions,
} from './for-exports.js'
import {makeInlineFunctionSynchronized} from './for-inline-functions.js'
import Synchronizer from './synchronizer.js'

function makeSynchronized(module, implementation) {
  if (typeof module === 'function') {
    return makeInlineFunctionSynchronized(module)
  }

  if (typeof implementation === 'function') {
    return makeSynchronizedFunction(module, implementation)
  }

  if (implementation) {
    return makeSynchronizedFunctions(module, implementation)
  }

  const synchronizer = Synchronizer.create({module})
  const defaultExportType = synchronizer.getInformation('default').type

  if (defaultExportType === VALUE_TYPE__FUNCTION) {
    return synchronizer.createDefaultExportFunctionProxy()
  }

  return synchronizer.createModule()
}

export {makeSynchronized, makeSynchronizedFunction, makeSynchronizedFunctions}
export {makeInlineFunctionSynchronized} from './for-inline-functions.js'
export {
  makeDefaultExportSynchronized,
  makeModuleSynchronized,
} from './for-modules.js'
