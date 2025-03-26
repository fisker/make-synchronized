import {IS_SERVER} from './constants.js'
import getValueInformation from './get-value-information.js'
import Synchronizer from './synchronizer.js'

function makeSynchronizedFunctions(module, implementation) {
  if (IS_SERVER) {
    return implementation
  }

  const synchronizer = Synchronizer.create(module)

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
  if (IS_SERVER) {
    return implementation
  }

  const synchronizer = Synchronizer.create(module)

  synchronizer.setKnownInformation(
    specifier,
    getValueInformation(implementation),
  )

  return synchronizer.get(specifier)
}

export {makeSynchronizedFunction, makeSynchronizedFunctions}
