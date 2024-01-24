import AtomicsWaitTimeoutError from './atomics-wait-timeout-error.js'

class Lock {
  /** @param {Int32Array} semaphore */
  static signal(semaphore) {
    return new Lock(semaphore).unlock()
  }

  semaphore

  constructor(semaphore = new Int32Array(new SharedArrayBuffer(4))) {
    this.semaphore = semaphore
  }

  /** @param {number} [timeout] */
  lock(timeout) {
    const status = Atomics.wait(this.semaphore, 0, 0, timeout)
    switch (status) {
      case 'timed-out':
        throw new AtomicsWaitTimeoutError()
      case 'ok':
        return
      default:
        throw new Error('Unexpected error.')
    }
  }

  unlock() {
    const {semaphore} = this
    Atomics.store(semaphore, 0, 1)
    Atomics.notify(semaphore, 0)
  }
}

export default Lock
