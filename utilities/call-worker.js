import {receiveMessageOnPort, MessageChannel} from 'node:worker_threads'

function callWorker(worker, action, payload) {
  const signal = new Int32Array(new SharedArrayBuffer(4))
  const {port1: localPort, port2: workerPort} = new MessageChannel()

  try {
    worker.postMessage(
      {
        signal,
        action,
        port: workerPort,
        payload,
      },
      [workerPort],
    )
  } catch {
    throw new Error('Cannot serialize data.')
  }

  Atomics.wait(signal, 0, 0)

  const {
    message: {result, error, errorData},
  } = receiveMessageOnPort(localPort)

  if (error) {
    throw Object.assign(error, errorData)
  }

  return result
}

export default callWorker
