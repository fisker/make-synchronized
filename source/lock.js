import AtomicsWaitError from './atomics-wait-error.js'

const UNLOCKED = 2

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
    const {semaphore} = this

    // Not reuseable
    this.semaphore = undefined

    // May already unlocked
    if (semaphore[0] === UNLOCKED) {
      return
    }

    const status = Atomics.wait(semaphore, 0, 0, timeout)

    if (status === 'ok') {
      return
    }

    throw new AtomicsWaitError(status)
  }

  unlock() {
    const {semaphore} = this
    Atomics.store(semaphore, 0, UNLOCKED)
    Atomics.notify(semaphore, 0)
  }
}

export default Lock
