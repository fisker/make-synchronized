import loadModuleForTests from '../../scripts/load-module-for-tests.js'

const {makeSynchronizedFunction, makeSynchronizedFunctions} =
  await loadModuleForTests()

export default makeSynchronizedFunction(
  import.meta,
  async () => 'default export called',
)
export const foo = makeSynchronizedFunction(
  import.meta,
  async () => 'foo export called',
  'foo',
)
export const {bar} = makeSynchronizedFunctions(import.meta, {
  bar: async () => 'bar export called',
})
