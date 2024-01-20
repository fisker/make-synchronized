export const {
  WORKER_ACTION_CALL,
  WORKER_ACTION_GET,
  WORKER_ACTION_OWN_KEYS,
  WORKER_ACTION_GET_PATH_INFORMATION,

  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_PRIMITIVE,
  VALUE_TYPE_UNKNOWN,
} = new Proxy({}, {get: (_, property) => `[[${property}]]`})
export const WORKER_URL = new URL('./worker.js', import.meta.url)
