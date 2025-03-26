import {isMainThread, workerData} from 'node:worker_threads'

export const IS_SERVER = !isMainThread && Boolean(workerData?.isServer)

export const IS_PRODUCTION = false
export const STDIO_STREAMS = ['stdout', 'stderr']

export const WORKER_ACTION__APPLY = '[[WORKER_ACTION__APPLY]]'
export const WORKER_ACTION__GET = '[[WORKER_ACTION__GET]]'
export const WORKER_ACTION__OWN_KEYS = '[[WORKER_ACTION__OWN_KEYS]]'
export const WORKER_ACTION__GET_INFORMATION =
  '[[WORKER_ACTION__GET_INFORMATION]]'

export const VALUE_TYPE__FUNCTION = '[[VALUE_TYPE__FUNCTION]]'
export const VALUE_TYPE__PRIMITIVE = '[[VALUE_TYPE__PRIMITIVE]]'
export const VALUE_TYPE__PLAIN_OBJECT = '[[VALUE_TYPE__PLAIN_OBJECT]]'
export const VALUE_TYPE__UNKNOWN = '[[VALUE_TYPE__UNKNOWN]]'

export const VALUE_INFORMATION__FUNCTION = {type: VALUE_TYPE__FUNCTION}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait#return_value
export const ATOMICS_WAIT_RESULT__OK = 'ok'
export const ATOMICS_WAIT_RESULT__NOT_EQUAL = 'not-equal'
export const ATOMICS_WAIT_RESULT__TIMED_OUT = 'timed-out'

// Currently, this is not used
export const RESPONSE_TYPE__RESOLVE = '[[RESPONSE_TYPE__RESOLVE]]'
export const RESPONSE_TYPE__REJECT = '[[RESPONSE_TYPE__REJECT]]'
export const RESPONSE_TYPE__TERMINATE = '[[RESPONSE_TYPE__TERMINATE]]'

export const MODULE_TYPE__INLINE_FUNCTION = '[[MODULE_TYPE__INLINE_FUNCTION]]'
