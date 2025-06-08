import AtomicsWaitError from './atomics-wait-error.js'
import {ATOMICS_WAIT_RESULT__TIMED_OUT} from './constants.js'

const STATE_LOCKED = 0
const STATE_UNLOCKED = 1
const SIGNAL_INDEX = 0

/** @param {Int32Array<SharedArrayBuffer>} semaphore */
const unlock = (semaphore) => {
  if (
    Atomics.compareExchange(
      semaphore,
      SIGNAL_INDEX,
      STATE_LOCKED,
      STATE_UNLOCKED,
    ) !== STATE_LOCKED
  ) {
    return
  }

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
    if (Atomics.load(semaphore, SIGNAL_INDEX) !== STATE_LOCKED) {
      return
    }

    const expected = STATE_LOCKED
    const result = Atomics.wait(semaphore, SIGNAL_INDEX, expected, timeout)

    if (result !== ATOMICS_WAIT_RESULT__TIMED_OUT) {
      return
    }

    throw new AtomicsWaitError(result, {semaphore, expected})
  }
}

export default Lock
export {unlock}
