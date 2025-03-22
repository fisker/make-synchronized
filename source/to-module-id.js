import * as path from 'node:path'
import * as url from 'node:url'

function toModuleId(module) {
  if (module instanceof URL) {
    return module.href
  }

  if (typeof module === 'string' && path.isAbsolute(module)) {
    return url.pathToFileURL(module).href
  }

  // `import.meta`
  if (typeof module?.url === 'string') {
    return module.url
  }

  return module
}

export default toModuleId
