import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronizedDefaultSpecifier} = await loadModuleForTests()

export default makeSynchronizedDefaultSpecifier(import.meta, {
  async identity(value) {
    return value
  },
  symbol: Symbol('for test'),
})

