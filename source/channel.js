import {MessageChannel, receiveMessageOnPort} from 'node:worker_threads'
import AtomicsWaitError from './atomics-wait-error.js'
import Lock from './lock.js'

class Channel {
  mainThreadPort
  workerPort
  alive = true
  #lock

  constructor() {
    const {port1: mainThreadPort, port2: workerPort} = new MessageChannel()
    mainThreadPort.unref()
    workerPort.unref()

    this.mainThreadPort = mainThreadPort
    this.workerPort = workerPort
    this.#lock = new Lock()
  }

  getResponse() {
    try {
      this.#lock.lock()
    } catch (error) {
      if (error instanceof AtomicsWaitError) {
        this.destroy()
      }

      throw error
    }

    const {message} = receiveMessageOnPort(this.mainThreadPort)
    return message
  }

  get semaphore() {
    return this.#lock.semaphore
  }

  destroy() {
    if (!this.alive) {
      return
    }

    this.alive = false
    this.mainThreadPort.close()
    this.workerPort.close()
    this.mainThreadPort = undefined
    this.workerPort = undefined
  }
}

export default Channel
