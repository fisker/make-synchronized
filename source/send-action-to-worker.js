import {receiveMessageOnPort, MessageChannel} from 'node:worker_threads'

class AtomicsWaitTimeoutError extends Error {
  name = 'AtomicsWaitTimeoutError'

  message = 'Timed out.'
}

function sendActionToWorker(worker, action, payload, timeout) {
  const signal = new Int32Array(new SharedArrayBuffer(4))
  const {port1: localPort, port2: workerPort} = new MessageChannel()

  try {
    worker.postMessage(
      {
        signal,
        port: workerPort,
        action,
        payload,
      },
      [workerPort],
    )
  } catch {
    throw new Error('Cannot serialize data.')
  }

  const status = Atomics.wait(signal, 0, 0, timeout)

  if (status === 'timed-out') {
    throw new AtomicsWaitTimeoutError()
  }

  const {
    message: {result, error, errorData},
  } = receiveMessageOnPort(localPort)

  if (error) {
    throw Object.assign(error, errorData)
  }

  return result
}

export default sendActionToWorker
