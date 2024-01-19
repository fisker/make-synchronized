import {
  VALUE_TYPE_FUNCTION,
} from './utilities/constants.js'
import functionToModule from './utilities/function-to-module.js'
import Synchronizer from "./utilities/synchronizer.js"

function makeSynchronizedDefaultExport(module) {
  return new Synchronizer({module}).getDefaultExportFunction();
}

function makeSynchronizedFunction(function_) {
  return makeSynchronizedDefaultExport(functionToModule(function_));
}

function makeSynchronizedModule(module) {
  return new Synchronizer({module}).createModule();
}

function makeSynchronized(module) {
  if (typeof module === 'function') {
    return makeSynchronizedFunction(module);
  }

  const synchronizer = new Synchronizer({module})
  const defaultExportType = synchronizer.getModuleSpecifiers().default?.type

  if (defaultExportType === VALUE_TYPE_FUNCTION) {
    return synchronizer.createDefaultExportFunctionProxy();
  }

  return synchronizer.createModule()
}

export default makeSynchronized;
export {
  makeSynchronized,
  makeSynchronizedDefaultExport,
  makeSynchronizedFunction,
  makeSynchronizedModule,
}