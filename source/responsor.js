import process from 'node:process'
import util from 'node:util'
import {STDIO_STREAMS} from './constants.js'
import {unlock} from './lock.js'

const originalProcessExit = process.exit

class Responsor {
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

  #send(response) {
    const {responsePort} = this.#channel
    const stdio = this.#stdio
    const exitCode = process.exitCode ?? 0

    try {
      responsePort.postMessage({...response, stdio, exitCode})
    } catch {
      const error = new Error(
        `Cannot serialize worker response:\n${util.inspect(response.result)}`,
      )
      responsePort.postMessage({error, stdio, exitCode})
    } finally {
      this.#finish()
    }
  }

  #sendResult(result) {
    this.#send({result})
  }

  #throws(error) {
    this.#send({error, errorData: {...error}})
  }

  #finish() {
    unlock(this.#responseSemaphore)
    process.exitCode = undefined
    this.#responseSemaphore = undefined
    this.#stdio.length = 0
  }

  #terminate() {
    this.#send({terminated: true})
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
      this.#sendResult(await this.#processAction(action, payload))
    } catch (error) {
      this.#throws(error)
    }
  }

  destroy() {
    this.#channel.responsePort.close()
    process.exitCode = undefined
  }
}

export default Responsor
