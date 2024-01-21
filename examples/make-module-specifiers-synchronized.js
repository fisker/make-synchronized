import makeSynchronized from 'make-synchronized'

const module = makeSynchronized(
  new URL(
    './asynchronous-modules/example-module-named-exports.js',
    import.meta.url,
  ),
)

console.log(module)
console.log(module.foo)
console.log(module.bar())
