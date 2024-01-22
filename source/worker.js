import {parentPort, workerData} from 'node:worker_threads'
import {
  WORKER_ACTION_APPLY,
  WORKER_ACTION_GET,
  WORKER_ACTION_OWN_KEYS,
  WORKER_ACTION_GET_INFORMATION,
  WORKER_ACTION_PING,
  WORKER_READY_SIGNAL,
} from './constants.js'
import getValueInformation from './get-value-information.js'
import {normalizePath} from './property-path.js'

async function processAction(action, payload) {
  if (action === WORKER_ACTION_PING) {
    return WORKER_READY_SIGNAL
  }

  let value = await import(workerData.moduleId)

  for (const property of normalizePath(payload.path)) {
    value = value[property]
  }

  switch (action) {
    case WORKER_ACTION_APPLY:
      return Reflect.apply(value, this, payload.argumentsList)
    case WORKER_ACTION_GET:
      return value
    case WORKER_ACTION_OWN_KEYS:
      return Reflect.ownKeys(value).filter((key) => typeof key !== 'symbol')
    case WORKER_ACTION_GET_INFORMATION:
      return getValueInformation(value)
    /* c8 ignore next 2 */
    default:
      throw new Error(`Unknown action '${action}'.`)
  }
}

async function onMessageReceived({signal, port, action, payload}) {
  const response = {}

  try {
    response.result = await processAction(action, payload)
  } catch (error) {
    response.error = error
    response.errorData = {...error}
  }

  try {
    port.postMessage(response)
  } catch {
    port.postMessage({
      error: new Error('Cannot serialize worker response.'),
    })
  } finally {
    port.close()
    Atomics.store(signal, 0, 1)
    Atomics.notify(signal, 0)
  }
}

parentPort.addListener('message', onMessageReceived)
