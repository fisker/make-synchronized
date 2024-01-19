import {
  Worker,
  receiveMessageOnPort,
  MessageChannel,
} from "node:worker_threads"
import {CALL, GET, GET_MODULE_SPECIFIERS} from './constants.js'
import createWorker from './utilities/create-worker.js'
import functionToModule from './utilities/function-to-module.js'
import callWorker from './utilities/call-worker.js'

function createSynchronizedFunction(worker, url, specifier) {
  return function (...argumentsList) {
    return callWorker(worker, CALL, {url, specifier, argumentsList})
  }
}

function createGetter(worker, url, property) {
  return function () {
    return callWorker(worker, GET, {url, property})
  }
}

function createDescriptor(getter) {
  let value;
  return {
    value,
    enumerable: true,
  };
}

function makeSynchronized(module) {
  const isFunction = typeof module === 'function'
  if (isFunction) {
    module = functionToModule(module);
  }

  const url = new URL(module).href
  let worker = createWorker()

  if (isFunction) {
    return createSynchronizedFunction(worker, url)
  }

  const specifiers = callWorker(worker, GET_MODULE_SPECIFIERS, {url});

  const functions = new Map()

  return Object.defineProperties(
    Object.create(null),
    Object.fromEntries(
      specifiers
        .map(({specifier, type}) => {
          let descriptor = {enumerable: true};
          if (type === 'function') {
            descriptor.value = createSynchronizedFunction(worker, url, specifier)
          } else {
            descriptor.get = createGetter(worker, url, specifier)
          }

          return [specifier, descriptor];
        })
    )
  )
}

export default makeSynchronized;