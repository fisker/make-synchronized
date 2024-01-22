import {receiveMessageOnPort, MessageChannel} from 'node:worker_threads'
import * as util from 'node:util'
import AtomicsWaitTimeoutError from './atomics-wait-timeout-error.js'

/**
@param {import('node:worker_threads').Worker} worker
@param {string} action
@param {Record<string, any>} payload
@param {number} [timeout]
@returns {import('./types.ts').WorkerResponseData}
*/
function request(worker, action, payload, timeout) {
  const signal = new Int32Array(new SharedArrayBuffer(4))
  const {port1: localPort, port2: workerPort} = new MessageChannel()

  try {
    worker.postMessage(
      {
        signal,
        port: workerPort,
        action,
        payload,
      },
      [workerPort],
    )
  } catch {
    throw Object.assign(
      new Error(`Cannot serialize request data:\n${util.inspect(payload)}`),
      {requestData: payload},
    )
  }

  const status = Atomics.wait(signal, 0, 0, timeout)

  if (status === 'timed-out') {
    throw new AtomicsWaitTimeoutError()
  }

  const {message} = receiveMessageOnPort(localPort)

  return message
}

export default request
