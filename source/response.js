import process from 'node:process'
import util from 'node:util'

const processExit = process.exit

class Response {
  #signal

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
    for (const type of ['stdout', 'stderr']) {
      process[type]._writev = (chunks, callback) => {
        for (const {chunk} of chunks) {
          this.#stdio.push({type, chunk})
        }

        callback()
      }
    }
  }

  #send(response) {
    const responsePort = this.#responsePort
    const signal = this.#signal

    try {
      responsePort.postMessage({...response, stdio: this.#stdio})
    } catch {
      const error = new Error(
        `Cannot serialize worker response:\n${util.inspect(response.result)}`,
      )

      responsePort.postMessage({error, stdio: this.#stdio})
    } finally {
      responsePort.close()

      Atomics.store(signal, 0, 1)
      Atomics.notify(signal, 0)
    }
  }

  #sendResult(result) {
    this.#send({result})
  }

  #throws(error) {
    this.#send({error, errorData: {...error}})
  }

  #terminate() {
    this.#send({terminated: true})
  }

  #processAction(action, payload) {
    const handler = this.#actionHandlers[action]

    /* c8 ignore next 3 */
    if (!handler) {
      throw new Error(`Unknown action '${action}'.`)
    }

    return handler(payload)
  }

  listen(receivePort) {
    receivePort.addListener(
      'message',
      async ({signal, port, action, payload}) => {
        this.#signal = signal
        this.#responsePort = port
        this.#stdio.length = 0

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
