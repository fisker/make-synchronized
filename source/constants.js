const WORKER_FILE_NAME = 'worker.js'

export const WORKER_ACTION_APPLY = '[[WORKER_ACTION_APPLY]]'
export const WORKER_ACTION_GET = '[[WORKER_ACTION_GET]]'
export const WORKER_ACTION_OWN_KEYS = '[[WORKER_ACTION_OWN_KEYS]]'
export const WORKER_ACTION_GET_INFORMATION = '[[WORKER_ACTION_GET_INFORMATION]]'

export const VALUE_TYPE_FUNCTION = '[[VALUE_TYPE_FUNCTION]]'
export const VALUE_TYPE_PRIMITIVE = '[[VALUE_TYPE_PRIMITIVE]]'
export const VALUE_TYPE_PLAIN_OBJECT = '[[VALUE_TYPE_PLAIN_OBJECT]]'
export const VALUE_TYPE_UNKNOWN = '[[VALUE_TYPE_UNKNOWN]]'

export const VALUE_INFORMATION_FUNCTION = {type: VALUE_TYPE_FUNCTION}

export const WORKER_FILE = new URL(WORKER_FILE_NAME, import.meta.url)

export const STDIO_STREAMS = ['stdout', 'stderr']

export const IS_PRODUCTION = false

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait#return_value
export const ATOMICS_WAIT_RESULT_OK = 'ok'
export const ATOMICS_WAIT_RESULT_NOT_EQUAL = 'not-equal'
export const ATOMICS_WAIT_RESULT_TIMED_OUT = 'timed-out'
