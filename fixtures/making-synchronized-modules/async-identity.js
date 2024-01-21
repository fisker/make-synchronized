import loadModuleForTests from '../../scripts/load-module-for-tests.js'

const {makeSynchronized} = await loadModuleForTests()

export default makeSynchronized(import.meta, async (value) => value)
