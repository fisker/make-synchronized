import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronizedDefaultSpecifier} = await loadModuleForTests()

export default makeSynchronizedDefaultSpecifier(import.meta, async (value) => value)
