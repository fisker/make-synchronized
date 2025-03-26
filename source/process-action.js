import {
  PING_ACTION_RESPONSE,
  WORKER_ACTION__APPLY,
  WORKER_ACTION__GET,
  WORKER_ACTION__GET_INFORMATION,
  WORKER_ACTION__OWN_KEYS,
  WORKER_ACTION__PING,
} from './constants.js'
import getValueInformation from './get-value-information.js'
import loadModule from './load-module.js'
import {normalizePath} from './property-path.js'

function getValue(value, payload) {
  let receiver
  for (const property of normalizePath(payload.path)) {
    receiver = value
    value = Reflect.get(value, property, value)
  }

  return {value, receiver}
}

async function processAction(action, payload) {
  if (action === WORKER_ACTION__PING) {
    return PING_ACTION_RESPONSE
  }

  const module = await loadModule()

  const result = getValue(module, payload)

  switch (action) {
    case WORKER_ACTION__GET:
      return result.value
    case WORKER_ACTION__APPLY:
      return Reflect.apply(result.value, result.receiver, payload.argumentsList)
    case WORKER_ACTION__OWN_KEYS:
      return Reflect.ownKeys(result.value).filter(
        (key) => typeof key !== 'symbol',
      )
    case WORKER_ACTION__GET_INFORMATION:
      return getValueInformation(result.value)
    // No default
  }

  /* c8 ignore next 3 */
  throw new Error(`Unknown action '${action}'.`)
}

export default processAction
