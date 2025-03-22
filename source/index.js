import {VALUE_TYPE_FUNCTION} from './constants.js'
import Synchronizer from './synchronizer.js'

/**
@typedef {import('./types.ts').Module} Module
@typedef {import('./types.ts').ModuleExportImplementation} ModuleExportImplementation
@typedef {import('./types.ts').AsynchronousFunction} AsynchronousFunction
@typedef {import('./types.ts').AsynchronousFunctions} AsynchronousFunctions
@typedef {import('./types.ts').PropertyPath} PropertyPath
@typedef {import('./types.ts').NodeModuleWithAsynchronousFunctionDefaultExport} NodeModuleWithAsynchronousFunctionDefaultExport
@typedef {import('./types.ts').MakeSynchronized} MakeSynchronized
*/

/** @type {MakeSynchronized} */
function makeSynchronized(module) {
  const synchronizer = Synchronizer.create({module})
  const {type: defaultExportType} = synchronizer.getInformation('default')

  if (defaultExportType === VALUE_TYPE_FUNCTION) {
    return synchronizer.createDefaultExportFunctionProxy()
  }

  return synchronizer.createModule()
}

export default makeSynchronized
