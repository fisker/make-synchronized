import * as path from 'node:path'
import * as url from 'node:url'
import util from 'node:util'

const isString = (value) => typeof value === 'string'
const filenameToModuleId = (filename) => url.pathToFileURL(filename).href

function toModuleId(module) {
  // `URL` and duck type
  if (isString(module?.href)) {
    return module.href
  }

  // `import.meta` and duck type with `url`
  if (isString(module?.url)) {
    return module.url
  }

  // `import.meta` and duck type with `filename`
  if (isString(module?.filename)) {
    return filenameToModuleId(module.filename)
  }

  if (!isString(module) || module.startsWith('.')) {
    throw new TypeError(
      `'module' should be an 'URL', 'import.meta' or an absolute path, got '${util.inspect(module)}'.`,
    )
  }

  // Absolute file path
  if (path.isAbsolute(module)) {
    return filenameToModuleId(module)
  }

  return module
}

export default toModuleId
