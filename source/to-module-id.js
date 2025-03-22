import * as path from 'node:path'
import * as url from 'node:url'

/** @import * as types from './types.ts'; */

/** @type {types.ToModuleId} */
function toModuleId(module) {
  if (module instanceof URL) {
    return module.href
  }

  if (typeof module === 'string' && path.isAbsolute(module)) {
    return url.pathToFileURL(module).href
  }

  // `import.meta`
  if (typeof module !== 'string' && typeof module?.url === 'string') {
    return module.url
  }

  return String(module)
}

export default toModuleId
