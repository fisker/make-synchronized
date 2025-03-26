import AtomicsWaitError from './atomics-wait-error.js'
import {ATOMICS_WAIT_RESULT__TIMED_OUT} from './constants.js'

const STATE_UNLOCKED = 2
const SIGNAL_INDEX = 0

/** @param {Int32Array<SharedArrayBuffer>} semaphore */
const unlock = (semaphore) => {
  Atomics.store(semaphore, SIGNAL_INDEX, STATE_UNLOCKED)
  Atomics.notify(semaphore, SIGNAL_INDEX, 1)
}

class Lock {
  semaphore = new Int32Array(
    new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT),
  )

  lock(timeout) {
    const {semaphore} = this

    // Not reuseable
    this.semaphore = undefined

    // Already unlocked
    if (Atomics.load(semaphore, SIGNAL_INDEX) > 0) {
      return
    }

    const expected = 0
    const result = Atomics.wait(semaphore, SIGNAL_INDEX, expected, timeout)

    if (result !== ATOMICS_WAIT_RESULT__TIMED_OUT) {
      return
    }

    throw new AtomicsWaitError(result, {semaphore, expected})
  }
}

export default Lock
export {unlock}
