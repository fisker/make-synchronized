import {receiveMessageOnPort, MessageChannel} from 'node:worker_threads'
import * as util from 'node:util'
import Lock from './lock.js'

/**
@param {import('node:worker_threads').Worker} worker
@param {string} action
@param {Record<string, any>} payload
@param {number} [timeout]
@returns {import('./types.ts').WorkerResponseData}
*/
function request(worker, action, payload, timeout) {
  const lock = new Lock()
  const {port1: localPort, port2: workerPort} = new MessageChannel()

  try {
    worker.postMessage(
      {
        semaphore: lock.semaphore,
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

  lock.lock(timeout)

  const {message} = receiveMessageOnPort(localPort)

  return message
}

export default request
