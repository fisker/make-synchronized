import makeSynchronized from 'make-synchronized'

const synchronized = makeSynchronized(
  new URL(
    './asynchronous-modules/example-module-default-export-is-a-asynchronous-function.js',
    import.meta.url,
  ),
)

console.log(synchronized())
console.log(synchronized.foo)
console.log(synchronized.bar())
