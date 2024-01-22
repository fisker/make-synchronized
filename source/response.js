import process from 'node:process'

const processExit = process.exit

class Response {
  #signal

  #responsePort

  #actionHandlers

  constructor(actionHandlers) {
    this.#actionHandlers = actionHandlers

    process.exit = () => {
      this.#terminate()
      processExit()
    }
  }

  #send(response) {
    const responsePort = this.#responsePort
    const signal = this.#signal

    try {
      responsePort.postMessage(response)
    } catch {
      responsePort.postMessage({
        error: new Error('Cannot serialize worker response.'),
      })
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
