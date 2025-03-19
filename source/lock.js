import AtomicsWaitError from './atomics-wait-error.js'
import {ATOMICS_WAIT_RESULT_TIMED_OUT} from './constants.js'

const STATE_UNLOCKED = 2
const SIGNAL_INDEX = 0

/** @param {Int32Array} semaphore */
const unlock = (semaphore) => {
  Atomics.store(semaphore, SIGNAL_INDEX, STATE_UNLOCKED)
  Atomics.notify(semaphore, SIGNAL_INDEX, 1)
}

class Lock {
  semaphore

  constructor(semaphore = new Int32Array(new SharedArrayBuffer(4))) {
    this.semaphore = semaphore
  }

  /** @param {number} [timeout] */
  lock(timeout = Number.POSITIVE_INFINITY) {
    const {semaphore} = this

    // Not reuseable
    this.semaphore = undefined

    // May already unlocked
    if (semaphore[SIGNAL_INDEX] === STATE_UNLOCKED) {
      return
    }

    const result = Atomics.wait(semaphore, SIGNAL_INDEX, 0, timeout)

    if (result !== ATOMICS_WAIT_RESULT_TIMED_OUT) {
      return
    }

    throw new AtomicsWaitError(result)
  }
}

export default Lock
export {unlock}
