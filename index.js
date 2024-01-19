import {
  Worker,
  receiveMessageOnPort,
  MessageChannel,
} from "node:worker_threads"
import {CALL} from './constants.js'
import createWorker from './utilities/create-worker.js'
import functionToModule from './utilities/function-to-module.js'
import callWorker from './utilities/call-worker.js'

function createFunction(url, specifier) {
  let worker
  url = url.href

  return function (...argumentsList) {
    worker ??= createWorker()
    return callWorker(worker, CALL, {url, specifier, argumentsList})
  }
}

function makeSynchronized(module) {
  if (typeof module === 'function') {
    module = functionToModule(module);
  }

  const url = new URL(module)

  const defaultExportFunction = createFunction(url)
  const functions = new Map([
    ['default', defaultExportFunction]
  ])

  return new Proxy(defaultExportFunction, {
    apply(target, thisArg, argumentsList) {
      return Reflect.apply(target, thisArg, argumentsList);
    },
    get(target, property, receiver) {
      if (!functions.has(property)) {
        functions.set(property, createFunction(url, property));
      }

      return functions.get(property);
    },
  })
}

export default makeSynchronized;