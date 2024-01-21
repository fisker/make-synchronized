export const {
  WORKER_ACTION_APPLY,
  WORKER_ACTION_GET,
  WORKER_ACTION_OWN_KEYS,
  WORKER_ACTION_GET_INFORMATION,
  WORKER_ACTION_PING,

  WORKER_READY_SIGNAL,

  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_PRIMITIVE,
  VALUE_TYPE_UNKNOWN,
} = new Proxy({}, {get: (_, property) => `[[${property}]]`})
export const WORKER_FILE = new URL('./worker.js', import.meta.url)
export const IS_DEVELOPMENT = true
