const WORKER_FILE_NAME = 'worker.js'

export const {
  // @ts-expect-error -- ?
  WORKER_ACTION_APPLY,
  // @ts-expect-error -- ?
  WORKER_ACTION_GET,
  // @ts-expect-error -- ?
  WORKER_ACTION_OWN_KEYS,
  // @ts-expect-error -- ?
  WORKER_ACTION_GET_INFORMATION,

  // @ts-expect-error -- ?
  VALUE_TYPE_FUNCTION,
  // @ts-expect-error -- ?
  VALUE_TYPE_PRIMITIVE,
  // @ts-expect-error -- ?
  VALUE_TYPE_PLAIN_OBJECT,
  // @ts-expect-error -- ?
  VALUE_TYPE_UNKNOWN,
} = new Proxy(
  {},
  {
    get:
      /** @param {string} property */
      (_, property) => `[[${property}]]`,
  },
)

export const WORKER_FILE = new URL(WORKER_FILE_NAME, import.meta.url)

export const STDIO_STREAMS = ['stdout', 'stderr']

export const IS_PRODUCTION = false
