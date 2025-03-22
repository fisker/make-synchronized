const normalizePath = (propertyOrPath = []) =>
  Array.isArray(propertyOrPath) ? propertyOrPath : [propertyOrPath]

const hashPath = (path) => JSON.stringify(normalizePath(path))

export {hashPath, normalizePath}
