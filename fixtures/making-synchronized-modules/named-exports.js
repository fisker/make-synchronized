import loadModuleForTests from '../../scripts/load-module-for-tests.js'

const {makeSynchronized} = await loadModuleForTests()

export default makeSynchronized(
  import.meta,
  async () => 'default export called',
)
export const {foo, bar} = makeSynchronized(import.meta, {
  foo: async () => 'foo export called',
  bar: async () => 'bar export called',
})
