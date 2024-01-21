const normalizePath = (propertyOrPath = []) =>
  Array.isArray(propertyOrPath) ? propertyOrPath : [propertyOrPath]

const hashPath = (path) => normalizePath(path).join('\0'.repeat(5))

export {hashPath, normalizePath}
