import {Worker} from 'node:worker_threads'
import process from 'node:process'
import {
  WORKER_FILE,
  WORKER_ACTION_PING,
  WORKER_READY_SIGNAL,
} from './constants.js'
import sendActionToWorker from './send-action-to-worker.js'

class ThreadsWorker {
  #worker

  #workerData

  constructor(workerData) {
    this.#workerData = workerData
  }

  sendAction(action, payload) {
    this.#worker ??= this.#createWorker()
    return sendActionToWorker(this.#worker, action, payload)
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
      response = sendActionToWorker(worker, WORKER_ACTION_PING, undefined, 500)
    } catch {}

    if (response !== WORKER_READY_SIGNAL) {
      throw new Error(
        `Unexpected error, most likely caused by syntax error in '${WORKER_FILE}'`,
      )
    }

    return worker
  }
}

export default ThreadsWorker
