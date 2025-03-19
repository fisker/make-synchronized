import {parentPort, workerData} from 'node:worker_threads'
import {
  WORKER_ACTION_APPLY,
  WORKER_ACTION_GET,
  WORKER_ACTION_OWN_KEYS,
  WORKER_ACTION_GET_INFORMATION,
} from './constants.js'
import getValueInformation from './get-value-information.js'
import {normalizePath} from './property-path.js'
import Response from './response.js'
import {unlock} from './lock.js'

let moduleImportPromise
let module
async function getValue(payload) {
  moduleImportPromise ??= import(workerData.moduleId)
  module ??= await moduleImportPromise

  let value = module

  let receiver
  for (const property of normalizePath(payload.path)) {
    receiver = value
    value = Reflect.get(value, property, value)
  }

  return {value, receiver}
}

const createHandler = (handler) => async (payload) =>
  handler(await getValue(payload), payload)

const actionHandlers = new Map(
  [
    [WORKER_ACTION_GET, ({value}) => value],
    [
      WORKER_ACTION_APPLY,
      ({value: method, receiver}, {argumentsList}) =>
        Reflect.apply(method, receiver, argumentsList),
    ],
    [
      WORKER_ACTION_OWN_KEYS,
      ({value}) =>
        Reflect.ownKeys(value).filter((key) => typeof key !== 'symbol'),
    ],
    [WORKER_ACTION_GET_INFORMATION, ({value}) => getValueInformation(value)],
  ].map(([action, handler]) => [action, createHandler(handler)]),
)

if (parentPort) {
  const response = new Response(actionHandlers)
  response.listen(parentPort)
}

const workerRunningSemaphore = workerData?.workerRunningSemaphore
if (workerRunningSemaphore) {
  unlock(workerRunningSemaphore)
}
