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
import Response from './response.js'

async function getValue(payload) {
  let value = await import(workerData.moduleId)

  let receiver
  for (const property of normalizePath(payload.path)) {
    receiver = value
    value = Reflect.get(value, property, value)
  }

  return {value, receiver}
}

const actionHandlers = {
  [WORKER_ACTION_PING]: () => WORKER_READY_SIGNAL,
  async [WORKER_ACTION_GET](payload) {
    const {value} = await getValue(payload)
    return value
  },
  async [WORKER_ACTION_APPLY](payload) {
    const {value: method, receiver} = await getValue(payload)
    return Reflect.apply(method, receiver, payload.argumentsList)
  },
  async [WORKER_ACTION_OWN_KEYS](payload) {
    const {value} = await getValue(payload)
    return Reflect.ownKeys(value).filter((key) => typeof key !== 'symbol')
  },
  async [WORKER_ACTION_GET_INFORMATION](payload) {
    const {value} = await getValue(payload)
    return getValueInformation(value)
  },
}

const response = new Response(actionHandlers)
response.listen(parentPort)
