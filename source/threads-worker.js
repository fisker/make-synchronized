import {Worker} from 'node:worker_threads'

import process from 'node:process'
import {WORKER_FILE} from './constants.js'
import Lock from './lock.js'
import request from './request.js'
import AtomicsWaitTimeoutError from './atomics-wait-timeout-error.js'

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
    const lock = new Lock()

    const worker = new Worker(WORKER_FILE, {
      execArgv: process.env.NODE_OPTIONS?.split(' '),
      workerData: {
        semaphore: lock.semaphore,
        ...this.#workerData,
      },
      // https://nodejs.org/api/worker_threads.html#new-workerfilename-options
      // Do not pipe `stdio`s
      stdout: true,
      stderr: true,
    })
    worker.unref()

    // Wait for worker to start
    try {
      lock.lock(1000)
    } catch (error) {
      if (error instanceof AtomicsWaitTimeoutError) {
        // eslint-disable-next-line unicorn/prefer-type-error
        throw new Error(
          `Unexpected error, most likely caused by syntax error in '${WORKER_FILE}'`,
        )
      }

      throw error
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
    const {terminated, result, error, errorData, stdio} = request(
      worker,
      action,
      payload,
      timeout,
    )

    for (const {chunk, type} of stdio) {
      process[type].write(chunk)
    }

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
