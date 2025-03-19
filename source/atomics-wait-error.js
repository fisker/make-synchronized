import {ATOMICS_WAIT_RESULT_TIMED_OUT} from './constants.js'

class AtomicsWaitError extends Error {
  code = ''

  name = 'AtomicsWaitError'

  constructor(code) {
    super(
      code === ATOMICS_WAIT_RESULT_TIMED_OUT
        ? 'Timed out'
        : 'Unexpected error',
    )

    this.code = code
  }
}

export default AtomicsWaitError
