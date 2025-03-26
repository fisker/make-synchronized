import process from 'node:process'
import {pathToFileURL} from 'node:url'
import * as util from 'node:util'
import {Worker} from 'node:worker_threads'
import Channel from './channel.js'
import {
  GLOBAL_SERVER_PROPERTY,
  IS_PRODUCTION,
  MODULE_TYPE__INLINE_FUNCTION,
  WORKER_ACTION__PING,
} from './constants.js'
import {isDataCloneError} from './data-clone-error.js'
import Lock from './lock.js'
import waitForWorker from './wait-for-worker.js'

// Node.js v18 and v19 eval worker code in script
// Node.js v20 seems also buggy on Windows
const shouldUseLegacyEvalMode = () => {
  const version = process.versions.node
  if (!version) {
    return true
  }

  const majorVersion = Number(version.split('.')[0])
  if (majorVersion < 20) {
    return true
  }

  if (majorVersion < 22 && process.platform === 'win32') {
    return true
  }

  return false
}

let workerFile

const setWorkFile = (file) => {
  workerFile = file
}

class ThreadsWorker {
  #worker
  #module
  #channel
  #workerIsAlive
  #workerOnlineLock

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

      const workUrl =
        workerFile instanceof URL ? workerFile : pathToFileURL(workerFile)

      worker = new Worker(
        shouldUseLegacyEvalMode()
          ? /* Indent */ `
            import(${JSON.stringify(workUrl)}).then(() => {
              globalThis[${JSON.stringify(GLOBAL_SERVER_PROPERTY)}]
                .setModuleInstance({default: ${module.code}})
            })
          `
          : /* Indent */ `
            import ${JSON.stringify(workUrl)}

            globalThis[${JSON.stringify(GLOBAL_SERVER_PROPERTY)}]
              .setModuleInstance({default: ${module.code}})
          `,
        workerOptions,
      )
    } else {
      workerData.module = module
      worker = new Worker(workerFile, workerOptions)
    }

    worker.unref()
    this.#workerIsAlive = false
    this.#workerOnlineLock = lock

    return worker
  }

  #killWorker(worker) {
    if (this.#worker !== worker) {
      return
    }

    this.#worker = undefined
    this.#workerIsAlive = false
    this.#workerOnlineLock = undefined
  }

  #createChannel() {
    if (this.#channel?.alive) {
      return false
    }

    this.#channel = new Channel()

    return true
  }

  sendAction(action, payload, timeout) {
    this.#worker ??= this.#createWorker()

    if (
      !IS_PRODUCTION &&
      !this.#workerIsAlive &&
      this.#workerOnlineLock &&
      action !== WORKER_ACTION__PING
    ) {
      // Wait for worker to start
      waitForWorker(this, this.#workerOnlineLock, workerFile)
      this.#workerIsAlive = true
      this.#workerOnlineLock = undefined
    }

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
      channel.getResponse(lock, timeout)

    if (stdio) {
      for (const {stream, chunk} of stdio) {
        process[stream].write(chunk)
      }
    }

    if (terminated || exitCode) {
      worker.terminate()
      channel.destroy()
      this.#killWorker(worker)
    }

    if (rejected) {
      throw error
    }

    return result
  }
}

export default ThreadsWorker
export {setWorkFile}
