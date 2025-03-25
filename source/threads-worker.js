import process from 'node:process'
import * as util from 'node:util'
import {Worker} from 'node:worker_threads'
import AtomicsWaitError from './atomics-wait-error.js'
import Channel from './channel.js'
import {IS_PRODUCTION} from './constants.js'
import {isDataCloneError} from './data-clone-error.js'
import Lock from './lock.js'

let workerFile

const setWorkFile = (file) => {
  workerFile = file
}

class ThreadsWorker {
  #worker
  #workerData
  #channel

  constructor(workerData) {
    this.#workerData = workerData
  }

  #createWorker() {
    const lock = IS_PRODUCTION ? {} : new Lock()

    const worker = new Worker(workerFile, {
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
          `Unexpected error, most likely caused by syntax error in '${workerFile}'`,
          {cause: error},
        )
      }

      throw error
    }

    return worker
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

    const requestMessage = [action, payload, lock.semaphore]

    const transferList = []

    const worker = this.#worker
    let channel = this.#channel

    // Created a new channel
    if (this.#createChannel()) {
      channel = this.#channel

      requestMessage.push({responsePort: channel.workerPort})
      transferList.push(channel.workerPort)
    }

    try {
      worker.postMessage(requestMessage, transferList)
    } catch (postMessageError) {
      if (isDataCloneError(postMessageError)) {
        throw Object.assign(
          new DOMException(
            `Cannot serialize request data:\n${util.inspect(payload)}`,
            'DataCloneError',
          ),
          {
            requestData: payload,
            cause: postMessageError,
          },
        )
      }

      throw postMessageError
    }

    const {stdio, exitCode, terminated, rejected, error, result} =
      channel.getResponse(lock)

    if (stdio) {
      for (const {stream, chunk} of stdio) {
        process[stream].write(chunk)
      }
    }

    if (terminated || exitCode) {
      worker.terminate()
      if (this.#worker === worker) {
        this.#worker = undefined
      }
      channel.destroy()
    }

    if (rejected) {
      throw error
    }

    return result
  }
}

export default ThreadsWorker
export {setWorkFile}
