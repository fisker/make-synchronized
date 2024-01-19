import * as url from 'node:url'
import * as path from 'node:path'

function toModuleId(module) {
  if (module instanceof URL) {
    return module.href
  }

  if (typeof module === 'string' && path.isAbsolute(module)) {
    module = url.pathToFileURL(module).href
  }

  return module
}

export default toModuleId
