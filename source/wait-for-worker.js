import AtomicsWaitError from './atomics-wait-error.js'
import {WORKER_ACTION__PING} from './constants.js'

function waitForWorker(worker, lock, workerFile) {
  let lockWaitError
  try {
    lock.lock(500)
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
    worker.sendAction(WORKER_ACTION__PING, undefined, 500)
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

  throw new AggregateError(
    [lockWaitError, pingError],
    `Unexpected error, most likely caused by syntax error in '${workerFile}'`,
  )
}

export default waitForWorker
