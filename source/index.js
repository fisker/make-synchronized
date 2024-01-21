import {isMainThread} from 'node:worker_threads'
import {VALUE_TYPE_FUNCTION} from './constants.js'
import functionToModule from './function-to-module.js'
import Synchronizer from './synchronizer.js'

function makeSynchronizedDefaultExport(module) {
  return Synchronizer.create({module}).getModulePathValue('default')
}

function makeSynchronizedFunction(function_) {
  return makeSynchronizedDefaultExport(functionToModule(function_))
}

function makeSynchronizedModule(module) {
  return Synchronizer.create({module}).createModule()
}

function makeSynchronizedDefaultSpecifier(moduleOrImportMeta, defaultExport) {
  if (!isMainThread) {
    return defaultExport
  }

  const synchronizer = Synchronizer.create({
    module: moduleOrImportMeta.url ?? moduleOrImportMeta,
  })

  return new Proxy(defaultExport, {
    apply: (target, thisArgument, argumentsList) =>
      Reflect.apply(
        synchronizer.getModulePathValue('default'),
        thisArgument,
        argumentsList,
      ),
    get: (target, property /* , receiver */) =>
      typeof target[property] === 'function'
        ? synchronizer.getModulePathValue(['default', property])
        : target[property],
    // Support more traps
  })
}

function makeSynchronized(...argumentsList) {
  if (argumentsList.length === 2) {
    return makeSynchronizedDefaultSpecifier(...argumentsList)
  }

  if (typeof argumentsList[0] === 'function') {
    return makeSynchronizedFunction(argumentsList[0])
  }

  const [module] = argumentsList

  const synchronizer = Synchronizer.create({module})
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
  makeSynchronizedDefaultSpecifier,
}
