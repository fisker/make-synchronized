import AtomicsWaitError from './atomics-wait-error.js'
import {
  ATOMICS_WAIT_RESULT_NOT_EQUAL,
  ATOMICS_WAIT_RESULT_TIMED_OUT,
} from './constants.js'

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

  lock(timeout = Number.POSITIVE_INFINITY) {
    const {semaphore} = this

    const before = this.#messageCount
    // Already unlocked
    const count = Atomics.load(semaphore, SIGNAL_INDEX)
    if (count > this.#messageCount) {
      console.log({unlocked: true, semaphore, before})
      this.#messageCount = count
      return
    }

    const result = Atomics.wait(
      semaphore,
      SIGNAL_INDEX,
      this.#messageCount,
      timeout,
    )

    this.#messageCount = Atomics.load(semaphore, SIGNAL_INDEX)

    if (result === ATOMICS_WAIT_RESULT_TIMED_OUT) {
      throw new AtomicsWaitError(result)
    }

    if (result === ATOMICS_WAIT_RESULT_NOT_EQUAL) {
      console.log({result, semaphore, before})
    }
  }
}

export default Lock
export {unlock}
