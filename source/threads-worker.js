import {Worker, receiveMessageOnPort, MessageChannel} from 'node:worker_threads'

import process from 'node:process'
import {
  WORKER_FILE,
  WORKER_ACTION_PING,
  WORKER_READY_SIGNAL,
} from './constants.js'

class AtomicsWaitTimeoutError extends Error {
  name = 'AtomicsWaitTimeoutError'

  message = 'Timed out.'
}

class ThreadsWorker {
  #worker

  #workerData

  constructor(workerData) {
    this.#workerData = workerData
  }

  sendAction(action, payload) {
    this.#worker ??= this.#createWorker()
    return this.#sendActionToWorker(this.#worker, action, payload)
  }

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
    let response
    try {
      response = this.#sendActionToWorker(
        worker,
        WORKER_ACTION_PING,
        undefined,
        500,
      )
    } catch {}

    if (response !== WORKER_READY_SIGNAL) {
      throw new Error(
        `Unexpected error, most likely caused by syntax error in '${WORKER_FILE}'`,
      )
    }

    return worker
  }

  #sendActionToWorker(worker, action, payload, timeout) {
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
      throw new Error('Cannot serialize data.')
    }

    const status = Atomics.wait(signal, 0, 0, timeout)

    if (status === 'timed-out') {
      throw new AtomicsWaitTimeoutError()
    }

    const {
      message: {terminated, result, error, errorData},
    } = receiveMessageOnPort(localPort)

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
