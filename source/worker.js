import module from 'node:module'
import {parentPort, workerData} from 'node:worker_threads'
import {
  WORKER_ACTION_APPLY,
  WORKER_ACTION_GET,
  WORKER_ACTION_GET_INFORMATION,
  WORKER_ACTION_OWN_KEYS,
} from './constants.js'
import getValueInformation from './get-value-information.js'
import {unlock} from './lock.js'
import {normalizePath} from './property-path.js'
import Responsor from './responsor.js'

module.enableCompileCache?.()

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
let responsor
parentPort.addListener(
  'message',
  ({channel, responseSemaphore, action, payload}) => {
    // Switch to a new channel
    if (channel) {
      responsor?.destroy()
      responsor = new Responsor(actionHandlers, channel)
    }

    responsor.process({responseSemaphore, action, payload})
  },
)

const {workerRunningSemaphore} = workerData
if (workerRunningSemaphore) {
  unlock(workerRunningSemaphore)
}

let moduleInstance
let moduleLoadError
// eslint-disable-next-line unicorn/prefer-top-level-await
const moduleImportPromise = loadModule()
async function getValue(payload) {
  if (moduleLoadError) {
    throw moduleLoadError
  }

  moduleInstance ??= await moduleImportPromise

  let value = moduleInstance

  let receiver
  for (const property of normalizePath(payload.path)) {
    receiver = value
    value = Reflect.get(value, property, value)
  }

  return {value, receiver}
}

async function loadModule() {
  try {
    return await import(workerData.moduleId)
  } catch (error) {
    moduleLoadError = error
  }
}
