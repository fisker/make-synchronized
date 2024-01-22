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
const hashPath = (path) => normalizePath(path).join('\0'.repeat(5))

export {hashPath, normalizePath}
