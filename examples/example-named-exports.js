import makeSynchronized from '../source/index.js'

const module = makeSynchronized(
  new URL('./modules/example-module-for-named-exports.js', import.meta.url),
)

console.log(module)
console.log(module.foo)
console.log(module.bar())
