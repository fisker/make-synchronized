import {isMainThread} from 'node:worker_threads'
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

/**
@template {AsynchronousFunctions} InputAsynchronousFunctions
@param {Module} module
@param {InputAsynchronousFunctions} implementation
@returns {import('./types.ts').SynchronizedFunctions<InputAsynchronousFunctions>}
*/
function makeSynchronizedFunctions(module, implementation) {
  if (!isMainThread) {
    return implementation
  }

  const synchronizer = Synchronizer.create({module})

  return new Proxy(implementation, {
    get: (target, property /* , receiver */) =>
      // @ts-expect-error -- ?
      typeof implementation[property] === 'function'
        ? synchronizer.get(property)
        : // @ts-expect-error -- ?
          target[property],
  })
}

/**
@template {AsynchronousFunction} InputAsynchronousFunction
@param {Module} module
@param {InputAsynchronousFunction} implementation
@param {PropertyPath} [specifier]
@returns {import('./types.ts').SynchronizedFunction<InputAsynchronousFunction>}
*/
function makeSynchronizedFunction(
  module,
  implementation,
  specifier = 'default',
) {
  if (!isMainThread) {
    return implementation
  }

  const synchronizer = Synchronizer.create({module})

  return synchronizer.get(specifier)
}

/**
@template {NodeModuleWithAsynchronousFunctionDefaultExport} InputNodeModule
@param {Module} module
@returns {import('./types.ts').SynchronizedFunction<InputNodeModule["default"]>}
*/
function makeDefaultExportSynchronized(module) {
  return Synchronizer.create({module}).get('default')
}

/**
@template {Record<string, any>} InputNodeModule
@param {Module} module
@returns {import('./types.ts').SynchronizedModule<InputNodeModule>}
*/
function makeModuleSynchronized(module) {
  // @ts-expect-error -- ?
  return Synchronizer.create({module}).createModule()
}

/** @type {MakeSynchronized} */
function makeSynchronized(module, implementation) {
  if (typeof implementation === 'function') {
    return makeSynchronizedFunction(module, implementation)
  }

  if (implementation) {
    return makeSynchronizedFunctions(module, implementation)
  }

  const synchronizer = Synchronizer.create({module})
  const defaultExportType = synchronizer.getInformation('default').type

  if (defaultExportType === VALUE_TYPE_FUNCTION) {
    return synchronizer.createDefaultExportFunctionProxy()
  }

  return synchronizer.createModule()
}

export default makeSynchronized
export {
  makeDefaultExportSynchronized,
  makeModuleSynchronized,
  makeSynchronized,
  makeSynchronizedFunction,
  makeSynchronizedFunctions,
}
