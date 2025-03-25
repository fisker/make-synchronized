import {isMainThread} from 'node:worker_threads'
import {VALUE_TYPE__FUNCTION} from './constants.js'
import getValueInformation from './get-value-information.js'
import Synchronizer from './synchronizer.js'

function makeSynchronizedFunctions(module, implementation) {
  if (!isMainThread) {
    return implementation
  }

  const synchronizer = Synchronizer.create({module})

  synchronizer.setKnownInformation(
    undefined,
    getValueInformation(implementation),
  )

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

  synchronizer.setKnownInformation(
    specifier,
    getValueInformation(implementation),
  )

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

  if (defaultExportType === VALUE_TYPE__FUNCTION) {
    return synchronizer.createDefaultExportFunctionProxy()
  }

  return synchronizer.createModule()
}

export {
  makeDefaultExportSynchronized,
  makeModuleSynchronized,
  makeSynchronized,
  makeSynchronizedFunction,
  makeSynchronizedFunctions,
}
