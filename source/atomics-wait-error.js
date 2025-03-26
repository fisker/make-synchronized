import {ATOMICS_WAIT_RESULT__TIMED_OUT} from './constants.js'

/* c8 ignore next -- debug feature */
class AtomicsWaitError extends Error {
  name = 'AtomicsWaitError'

  constructor(code, {semaphore, expected}) {
    super(
      code === ATOMICS_WAIT_RESULT__TIMED_OUT
        ? 'Timed out'
        : 'Unexpected error',
    )

    Object.assign(this, {code, semaphore, expected})
  }
}

export default AtomicsWaitError
