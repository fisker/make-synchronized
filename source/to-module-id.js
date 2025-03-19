import * as path from 'node:path'
import * as url from 'node:url'

/**
@param {import('./types.ts').Module} module
@returns {import('./types.ts').ModuleId}
*/
function toModuleId(module) {
  if (module instanceof URL) {
    return module.href
  }

  if (typeof module === 'string' && path.isAbsolute(module)) {
    return url.pathToFileURL(module).href
  }

  // `import.meta`
  if (
    typeof module !== 'string' &&
    typeof module?.url === 'string' &&
    module.url.startsWith('file:')
  ) {
    return module.url
  }

  // @ts-expect-error -- Safe
  return module
}

export default toModuleId
