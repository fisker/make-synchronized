import {parentPort} from 'node:worker_threads'
import {
  WORKER_ACTION_CALL,
  WORKER_ACTION_GET,
  WORKER_ACTION_OWN_KEYS,
  WORKER_ACTION_GET_PATH_INFORMATION,
} from './constants.js'
import getValueInformation from './get-value-information.js'
import {normalizePath} from './property-path.js'

async function processAction(action, moduleId, path, payload) {
  let value = await import(moduleId)

  for (const property of normalizePath(path)) {
    value = value[property]
  }

  switch (action) {
    case WORKER_ACTION_CALL:
      return Reflect.apply(value, this, payload.argumentsList)
    case WORKER_ACTION_GET:
      return value
    case WORKER_ACTION_OWN_KEYS:
      return Reflect.ownKeys(value).filter((key) => typeof key !== 'symbol')
    case WORKER_ACTION_GET_PATH_INFORMATION:
      return getValueInformation(value)
    default:
      throw new Error(`Unknown action '${action}'.`)
  }
}

async function onMessageReceived({
  signal,
  port,
  action,
  moduleId,
  path,
  payload,
}) {
  const response = {}

  try {
    response.result = await processAction(action, moduleId, path, payload)
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
