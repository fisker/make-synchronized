import * as path from 'node:path'
import * as url from 'node:url'
import util from 'node:util'

const isString = (value) => typeof value === 'string'
const filenameToModuleId = (filename) => url.pathToFileURL(filename).href

function toModuleSource(module) {
  // `URL` and duck type
  const href = module?.href
  if (isString(href)) {
    return href
  }

  // `import.meta` and duck type with `url`
  const url = module?.url
  if (isString(url)) {
    return url
  }

  // `import.meta` and duck type with `filename`
  const filename = module?.filename
  if (isString(filename)) {
    return filenameToModuleId(filename)
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

function normalizeModule(module) {
  return {source: toModuleSource(module)}
}

export default normalizeModule
