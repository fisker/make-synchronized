import process from 'node:process'
import {Worker} from 'node:worker_threads'
import AtomicsWaitError from './atomics-wait-error.js'
import {IS_PRODUCTION, WORKER_FILE} from './constants.js'
import Lock from './lock.js'
import request from './request.js'

/**
@typedef {import('./types.ts')} types
*/

class ThreadsWorker {
  /** @type {Worker} */
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
  @returns {Worker}
  */
  #createWorker() {
    const lock = IS_PRODUCTION ? {} : new Lock()

    const worker = new Worker(WORKER_FILE, {
      workerData: {
        workerRunningSemaphore: lock.semaphore,
        ...this.#workerData,
      },
      // https://nodejs.org/api/worker_threads.html#new-workerfilename-options
      // Do not pipe `stdio`s
      stdout: true,
      stderr: true,
    })
    worker.unref()

    if (IS_PRODUCTION) {
      return worker
    }

    // Wait for worker to start
    try {
      lock.lock(1000)
    } catch (error) {
      if (error instanceof AtomicsWaitError) {
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
  @param {Worker} worker
  @param {string} action
  @param {Record<string, any>} payload
  @param {number} [timeout]
  */
  #sendActionToWorker(worker, action, payload, timeout) {
    // @ts-expect-error -- ?
    const {stdio, result, error, errorData, terminated} = request(
      worker,
      action,
      payload,
      timeout,
    )

    for (const {stream, chunk} of stdio) {
      process[stream].write(chunk)
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
