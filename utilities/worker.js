import {parentPort} from 'node:worker_threads'
import {
  WORKER_ACTION_CALL,
  WORKER_ACTION_GET,
  WORKER_ACTION_GET_MODULE_SPECIFIERS,
} from './constants.js'
import getValueType from './get-value-type.js'

async function callFunction({moduleId, specifier = 'default', argumentsList}) {
  const module = await import(moduleId)

  return Reflect.apply(module[specifier], this, argumentsList)
}

async function getSpecifiers({moduleId}) {
  const module = await import(moduleId)

  return Object.fromEntries(
    Object.entries(module).map(([specifier, value]) => [
      specifier,
      {
        name: specifier,
        type: getValueType(value),
      },
    ]),
  )
}

async function getProperty({moduleId, property}) {
  const module = await import(moduleId)

  return module[property]
}

function processAction(action, payload) {
  switch (action) {
    case WORKER_ACTION_CALL:
      return callFunction(payload)
    case WORKER_ACTION_GET:
      return getProperty(payload)
    case WORKER_ACTION_GET_MODULE_SPECIFIERS:
      return getSpecifiers(payload)
    default:
      throw new Error(`Unknown action '${action}'.`)
  }
}

async function listener({signal, action, port, payload}) {
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

parentPort.addListener('message', listener)
