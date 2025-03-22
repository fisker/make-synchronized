import {isMainThread} from 'node:worker_threads'
import {VALUE_TYPE_FUNCTION} from './constants.js'
import Synchronizer from './synchronizer.js'

function makeSynchronizedFunctions(module, implementation) {
  if (!isMainThread) {
    return implementation
  }

  const synchronizer = Synchronizer.create({module})

  return new Proxy(implementation, {
    get: (target, property /* , receiver */) =>
      typeof implementation[property] === 'function'
        ? synchronizer.get(property)
        : target[property],
  })
}

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

function makeDefaultExportSynchronized(module) {
  return Synchronizer.create({module}).get('default')
}

function makeModuleSynchronized(module) {
  return Synchronizer.create({module}).createModule()
}

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
  makeSynchronized as 'module.exports',
}
