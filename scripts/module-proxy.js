import {createRequire} from 'node:module'
import * as process from 'node:process'

function loadModuleForTests() {
  switch (process.env.DIST_TEST_TYPE) {
    case 'esm':
      return import('../index.mjs')
    case 'cjs':
      return createRequire(import.meta.url)('../index.cjs')
    default:
      return import('../source/index.js')
  }
}

export default await loadModuleForTests()
