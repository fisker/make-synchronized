import process from 'node:process'
import * as util from 'node:util'
import {Worker} from 'node:worker_threads'
import AtomicsWaitError from './atomics-wait-error.js'
import Channel from './channel.js'
import {IS_PRODUCTION, WORKER_FILE} from './constants.js'
import Lock from './lock.js'

class ThreadsWorker {
  #worker
  #workerData
  #channel

  constructor(workerData) {
    this.#workerData = workerData
  }

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
          {cause: error},
        )
      }

      throw error
    }

    return worker
  }

  #killWorker() {
    this.#worker.terminate()
    this.#worker = undefined
  }

  #createChannel() {
    if (this.#channel?.alive) {
      return false
    }

    this.#channel = new Channel()

    return true
  }

  sendAction(action, payload) {
    this.#worker ??= this.#createWorker()

    // TODO: Move this into `Channel`
    const lock = new Lock()

    const message = {
      action,
      payload,
      responseSemaphore: lock.semaphore,
    }

    const transferList = []

    const worker = this.#worker
    let channel = this.#channel

    // Created a new channel
    if (this.#createChannel()) {
      channel = this.#channel

      message.channel = {
        responsePort: channel.workerPort,
      }
      transferList.push(channel.workerPort)
    }

    try {
      worker.postMessage(message, transferList)
    } catch {
      throw Object.assign(
        new Error(`Cannot serialize request data:\n${util.inspect(payload)}`),
        {requestData: payload},
      )
    }

    const {stdio, result, error, errorData, terminated} =
      channel.getResponse(lock)

    for (const {stream, chunk} of stdio) {
      process[stream].write(chunk)
    }

    if (terminated) {
      this.#killWorker()
      channel.destroy()
    }

    if (error) {
      throw Object.assign(error, errorData)
    }

    return result
  }
}

export default ThreadsWorker
