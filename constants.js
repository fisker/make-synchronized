export const {
  CALL,
  GET,
  GET_MODULE_SPECIFIERS,
} = new Proxy({}, {get: (_, property) => `[[${property}]]`})
export const WORKER_URL = new URL('./worker.js', import.meta.url)