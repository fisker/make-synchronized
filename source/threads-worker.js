import {Worker} from 'node:worker_threads'

import process from 'node:process'
import {
  WORKER_FILE,
  WORKER_ACTION_PING,
  WORKER_READY_SIGNAL,
} from './constants.js'
import request from './request.js'

/** @typedef {import('./types.ts')} types */

class ThreadsWorker {
  /** @type {types.Worker} */
  #worker

  #workerData

  constructor(workerData) {
    this.#workerData = workerData
  }

  sendAction(action, payload) {
    this.#worker ??= this.#createWorker()
    return this.#sendActionToWorker(this.#worker, action, payload)
  }

  /**
  @returns {types.Worker}
  */
  #createWorker() {
    const worker = new Worker(WORKER_FILE, {
      execArgv: (process.env.NODE_OPTIONS ?? '').split(' '),
      workerData: this.#workerData,
    })
    worker.unref()

    /*
    We are running worker synchronously,
    it's not possible to get syntax error by add listener to `error` event,
    it's worth to add this check since any syntax error will cause the program hangs forever.
    Since it's only a development problem, we can consider remove it if we use a bundler
    */
    const response = this.#sendActionToWorker(
      worker,
      WORKER_ACTION_PING,
      undefined,
      1000,
    )

    if (response !== WORKER_READY_SIGNAL) {
      throw new Error(
        `Unexpected error, most likely caused by syntax error in '${WORKER_FILE}'`,
      )
    }

    return worker
  }

  /**
  @param {types.Worker} worker
  @param {string} action
  @param {Record<string, any>} payload
  @param {number} [timeout]
  */
  #sendActionToWorker(worker, action, payload, timeout) {
    const {terminated, result, error, errorData} = request(
      worker,
      action,
      payload,
      timeout,
    )

    if (terminated && this.#worker) {
      this.#worker.terminate()
      this.#worker = undefined
    }

    if (error) {
      throw Object.assign(error, errorData)
    }

    return result
  }
}

export default ThreadsWorker
