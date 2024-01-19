export const {
  WORKER_ACTION_CALL,
  WORKER_ACTION_GET,
  WORKER_ACTION_GET_MODULE_SPECIFIERS,

  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_ARRAY,
  VALUE_TYPE_OBJECT,
} = new Proxy({}, {get: (_, property) => `[[${property}]]`})
export const WORKER_URL = new URL('./worker.js', import.meta.url)
