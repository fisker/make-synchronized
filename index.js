import {
  Worker,
  receiveMessageOnPort,
  MessageChannel,
} from "node:worker_threads"
import {CALL, GET, GET_MODULE_SPECIFIERS} from './constants.js'
import createWorker from './utilities/create-worker.js'
import functionToModule from './utilities/function-to-module.js'
import Synchronizer from "./utilities/synchronizer.js"

function makeSynchronized(module) {
  const isFunction = typeof module === 'function'
  if (isFunction) {
    module = functionToModule(module);
  }

  const synchronizer = new Synchronizer({module})

  if (isFunction) {
    return synchronizer.createSynchronizedFunction()
  }

  const specifiers = synchronizer.getModuleSpecifiers();

  return Object.defineProperties(
    Object.create(null),
    Object.fromEntries(
      specifiers
        .map(({specifier, type}) => {
          let descriptor = {enumerable: true};
          if (type === 'function') {
            descriptor.value = synchronizer.createSynchronizedFunction(specifier)
          } else {
            descriptor.get = synchronizer.createGetter(specifier)
          }

          return [specifier, descriptor];
        })
    )
  )
}

export default makeSynchronized;