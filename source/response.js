import process from 'node:process'
import util from 'node:util'
import {STDIO_STREAMS} from './constants.js'
import {unlock} from './lock.js'

const processExit = process.exit

class Response {
  #responseSemaphore

  #responsePort

  #actionHandlers

  #stdio = []

  constructor(actionHandlers) {
    this.#actionHandlers = actionHandlers

    process.exit = () => {
      this.#terminate()
      processExit()
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
    const responsePort = this.#responsePort

    try {
      responsePort.postMessage({...response, stdio: this.#stdio})
    } catch {
      const error = new Error(
        `Cannot serialize worker response:\n${util.inspect(response.result)}`,
      )
      responsePort.postMessage({error, stdio: this.#stdio})
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
    this.#responsePort.close()
    this.#responseSemaphore = undefined
    this.#responsePort = undefined
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

  listen(receivePort) {
    receivePort.addListener(
      'message',
      async ({responseSemaphore, responsePort, action, payload}) => {
        this.#responseSemaphore = responseSemaphore
        this.#responsePort = responsePort

        try {
          this.#sendResult(await this.#processAction(action, payload))
        } catch (error) {
          this.#throws(error)
        }
      },
    )
  }
}

export default Response
