import makeSynchronized from "./index.js"

const {
  default: identity
} = makeSynchronized(
  new URL('./fixtures/async-identity.js', import.meta.url)
)

console.log(identity('test, test, test one two three'))