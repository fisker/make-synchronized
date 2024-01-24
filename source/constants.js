const WORKER_FILE_NAME = 'worker.js'

export const {
  WORKER_ACTION_APPLY,
  WORKER_ACTION_GET,
  WORKER_ACTION_OWN_KEYS,
  WORKER_ACTION_GET_INFORMATION,

  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_PRIMITIVE,
  VALUE_TYPE_PLAIN_OBJECT,
  VALUE_TYPE_UNKNOWN,
} = new Proxy({}, {get: (_, property) => `[[${property}]]`})

export const WORKER_FILE = new URL(WORKER_FILE_NAME, import.meta.url)
