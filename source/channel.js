import {MessageChannel, receiveMessageOnPort} from 'node:worker_threads'
import AtomicsWaitError from './atomics-wait-error.js'

class Channel {
  mainThreadPort
  workerPort
  alive = true

  constructor() {
    const {port1: mainThreadPort, port2: workerPort} = new MessageChannel()
    mainThreadPort.unref()
    workerPort.unref()

    this.mainThreadPort = mainThreadPort
    this.workerPort = workerPort
  }

  getResponse(lock) {
    try {
      lock.lock()
    } catch (error) {
      if (error instanceof AtomicsWaitError) {
        this.destroy()
      }

      throw error
    }

    try {
      const {message} = receiveMessageOnPort(this.mainThreadPort)

      return message
    } catch {
      console.log(this)
    }
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
