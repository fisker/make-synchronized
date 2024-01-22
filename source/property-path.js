/*
@param {import('./types.ts').PropertyPath} propertyOrPath
@returns {NormalizedPropertyPath}
*/
const normalizePath = (propertyOrPath = []) =>
  Array.isArray(propertyOrPath) ? propertyOrPath : [propertyOrPath]

/*
@param {import('./types.ts').PropertyPath} propertyOrPath
@returns {string}
*/
const hashPath = (path) => JSON.stringify(normalizePath(path))

export {hashPath, normalizePath}
