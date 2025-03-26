import AtomicsWaitError from './atomics-wait-error.js'
import {IS_PRODUCTION, WORKER_ACTION__PING} from './constants.js'

/* c8 ignore next -- debug feature */
function waitForWorker(worker, lock, workerFile) {
  if (IS_PRODUCTION) {
    return
  }

  let lockWaitError
  try {
    lock.lock(2000)
  } catch (error) {
    if (error instanceof AtomicsWaitError) {
      lockWaitError = error
    } else {
      throw error
    }
  }

  if (!lockWaitError) {
    return
  }

  let pingError
  try {
    worker.sendAction(WORKER_ACTION__PING, undefined, 2000)
  } catch (error) {
    if (error instanceof AtomicsWaitError) {
      pingError = error
    } else {
      throw error
    }
  }

  if (!pingError) {
    return
  }

  if (lockWaitError) {
    throw new AggregateError(
      [lockWaitError, pingError],
      `Unexpected error, most likely caused by syntax error in '${workerFile}'`,
    )
  }
}

export default waitForWorker
