import * as util from 'node:util'
import {MessageChannel, receiveMessageOnPort} from 'node:worker_threads'
import Lock from './lock.js'

/**
@import * as types from './types.ts';
*/

/**
@param {types.Worker} worker
@param {string} action
@param {Record<string, undefined>} payload
@param {number} [timeout]
@returns {types.WorkerResponseData}
*/
function request(worker, action, payload, timeout) {
  const lock = new Lock()
  const {port1: mainThreadPort, port2: workerPort} = new MessageChannel()
  mainThreadPort.unref()
  workerPort.unref()

  try {
    worker.postMessage(
      {
        responseSemaphore: lock.semaphore,
        responsePort: workerPort,
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

  const {message} = receiveMessageOnPort(mainThreadPort)

  return message
}

export default request
