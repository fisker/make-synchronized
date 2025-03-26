import process from 'node:process'
import * as util from 'node:util'
import {Worker} from 'node:worker_threads'
import AtomicsWaitError from './atomics-wait-error.js'
import Channel from './channel.js'
import {
  GLOBAL_SERVER_PROPERTY,
  IS_PRODUCTION,
  MODULE_TYPE__INLINE_FUNCTION,
} from './constants.js'
import {isDataCloneError} from './data-clone-error.js'
import Lock from './lock.js'

let workerFile

const setWorkFile = (file) => {
  workerFile = file
}

class ThreadsWorker {
  #worker
  #module
  #channel

  constructor(module) {
    this.#module = module
  }

  #createWorker() {
    const module = this.#module

    const workerData = {isServer: true}
    const workerOptions = {
      workerData,
      // https://nodejs.org/api/worker_threads.html#new-workerfilename-options
      // Do not pipe `stdio`s
      stdout: true,
      stderr: true,
    }

    let lock
    if (!IS_PRODUCTION) {
      lock = new Lock()
      workerOptions.workerData.workerRunningSemaphore = lock.semaphore
    }

    let worker
    if (module.type === MODULE_TYPE__INLINE_FUNCTION) {
      workerData.exposeSetModuleInstance = true
      workerOptions.eval = true

      worker = new Worker(
        /* Indent */ `
          import ${JSON.stringify(workerFile)}

          globalThis[${JSON.stringify(GLOBAL_SERVER_PROPERTY)}].setModuleInstance({default: ${module.code}})
        `,
        workerOptions,
      )
    } else {
      workerData.module = module
      worker = new Worker(workerFile, workerOptions)
    }

    worker.unref()

    if (IS_PRODUCTION) {
      return worker
    }

    // Wait for worker to start
    try {
      lock.lock(60_000)
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
