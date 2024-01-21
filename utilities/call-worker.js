import {Worker, receiveMessageOnPort, MessageChannel} from 'node:worker_threads'
import {
  WORKER_URL,
  WORKER_ACTION_PING,
  WORKER_READY_SIGNAL,
} from './constants.js'

function createWorker(options) {
  const worker = new Worker(WORKER_URL, options)
  worker.unref()

  /*
  We are running worker synchronously,
  it's not possible to get syntax error by add listener to `error` event,
  it's worth to add this check since any syntax error will cause the program hangs forever.
  Since it's only a development problem, we can consider remove it if we use a bundler
  */
  let response
  try {
    response = sendActionToWorker(worker, WORKER_ACTION_PING, undefined, 500)
  } catch {}

  if (response !== WORKER_READY_SIGNAL) {
    throw new Error(
      "Unexpected error, most likely caused by syntax error in 'worker.js'",
    )
  }

  return worker
}

class AtomicsWaitTimeoutError extends Error {
  name = 'AtomicsWaitTimeoutError'

  message = 'Timed out.'
}

function sendActionToWorker(worker, action, payload, timeout) {
  const signal = new Int32Array(new SharedArrayBuffer(4))
  const {port1: localPort, port2: workerPort} = new MessageChannel()

  try {
    worker.postMessage(
      {
        signal,
        port: workerPort,
        action,
        ...payload,
      },
      [workerPort],
    )
  } catch {
    throw new Error('Cannot serialize data.')
  }

  const status = Atomics.wait(signal, 0, 0, timeout)

  if (status === 'timed-out') {
    throw new AtomicsWaitTimeoutError()
  }

  const {
    message: {result, error, errorData},
  } = receiveMessageOnPort(localPort)

  if (error) {
    throw Object.assign(error, errorData)
  }

  return result
}

let worker
function callWorker(action, moduleId, path, payload) {
  worker ??= createWorker()
  return sendActionToWorker(worker, action, {moduleId, path, payload})
}

export default callWorker
