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

  lock(port, timeout = Number.POSITIVE_INFINITY) {
    const {semaphore} = this
    while (true) {
      const result = Atomics.wait(
        semaphore,
        SIGNAL_INDEX,
        this.#messageCount,
        timeout,
      )

      this.#messageCount = Atomics.load(semaphore, SIGNAL_INDEX)
      console.log({
        result,
        semaphore,
        count: this.#messageCount,
      })
      if (result === ATOMICS_WAIT_RESULT_TIMED_OUT) {
        throw new AtomicsWaitError(result)
      }

      if (result !== ATOMICS_WAIT_RESULT_NOT_EQUAL) {
        return
      }
    }
  }
}

export default Lock
export {unlock}
