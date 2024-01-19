import makeSynchronized from "../index.js";

const synchronized = makeSynchronized(
  new URL('./modules/example-module-for-default-export-is-a-function.js', import.meta.url)
)

console.log(synchronized())
console.log(synchronized.foo)
console.log(synchronized.bar())
