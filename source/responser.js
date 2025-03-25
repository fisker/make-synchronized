import process from 'node:process'
import util from 'node:util'
import {
  RESPONSE_TYPE__REJECT,
  RESPONSE_TYPE__TERMINATE,
  STDIO_STREAMS,
} from './constants.js'
import {isDataCloneError} from './data-clone-error.js'
import {unlock} from './lock.js'
import {packResponseMessage} from './response-message.js'

const originalProcessExit = process.exit

class Responser {
  #channel
  #actionHandlers
  #stdio = []
  #responseSemaphore

  constructor(actionHandlers, channel) {
    this.#actionHandlers = actionHandlers
    this.#channel = channel

    process.exit = (exitCode) => {
      process.exitCode = exitCode
      this.#terminate()
      originalProcessExit(exitCode)
    }

    // https://github.com/nodejs/node/blob/66556f53a7b36384bce305865c30ca43eaa0874b/lib/internal/worker/io.js#L369
    for (const stream of STDIO_STREAMS) {
      process[stream]._writev = (chunks, callback) => {
        for (const {chunk} of chunks) {
          this.#stdio.push({stream, chunk})
        }

        callback()
      }
    }
  }

  #send(data, type) {
    const {responsePort} = this.#channel
    const stdio = this.#stdio
    const message = packResponseMessage(stdio, data, type)

    try {
      responsePort.postMessage(message)
    } catch (postMessageError) {
      const error = isDataCloneError(postMessageError)
        ? new Error(
            `Cannot serialize worker response:\n${util.inspect(data)}`,
            {cause: postMessageError},
          )
        : postMessageError

      responsePort.postMessage(
        packResponseMessage(stdio, error, RESPONSE_TYPE__REJECT),
      )
    } finally {
      this.#finish()
    }
  }

  #resolve(result) {
    this.#send(result)
  }

  #reject(error) {
    this.#send(error, RESPONSE_TYPE__REJECT)
  }

  #finish() {
    unlock(this.#responseSemaphore)
    process.exitCode = undefined
    this.#responseSemaphore = undefined
    this.#stdio.length = 0
  }

  #terminate() {
    this.#send(undefined, RESPONSE_TYPE__TERMINATE)
  }

  #processAction(action, payload) {
    const actionHandlers = this.#actionHandlers

    /* c8 ignore next 3 */
    if (!actionHandlers.has(action)) {
      throw new Error(`Unknown action '${action}'.`)
    }

    return actionHandlers.get(action)(payload)
  }

  async process({responseSemaphore, action, payload}) {
    this.#responseSemaphore = responseSemaphore

    try {
      this.#resolve(await this.#processAction(action, payload))
    } catch (error) {
      this.#reject(error)
    }
  }

  destroy() {
    this.#channel.responsePort.close()
    process.exitCode = undefined
  }
}

export default Responser
