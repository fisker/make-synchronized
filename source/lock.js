import AtomicsWaitError from './atomics-wait-error.js'
import {ATOMICS_WAIT_RESULT__TIMED_OUT} from './constants.js'

const SIGNAL_INDEX = 0

/** @param {Int32Array<SharedArrayBuffer>} semaphore */
const unlock = (semaphore) => {
  Atomics.add(semaphore, SIGNAL_INDEX, 1)
  Atomics.notify(semaphore, SIGNAL_INDEX, 1)
}

class Lock {
  semaphore = new Int32Array(
    new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT),
  )

  #messageCount = 0

  lock(timeout) {
    const {semaphore} = this

    // Not reuseable
    this.semaphore = undefined

    // Already unlocked
    const count = Atomics.load(semaphore, SIGNAL_INDEX)
    if (count > this.#messageCount) {
      this.#messageCount = count
      return
    }

    const expected = this.#messageCount
    const result = Atomics.wait(semaphore, SIGNAL_INDEX, expected, timeout)
    this.#messageCount = Atomics.load(semaphore, SIGNAL_INDEX)

    if (result !== ATOMICS_WAIT_RESULT__TIMED_OUT) {
      return
    }

    throw new AtomicsWaitError(result, {semaphore, expected})
  }
}

export default Lock
export {unlock}
