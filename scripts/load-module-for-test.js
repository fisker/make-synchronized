import * as process from 'node:process'
import {createRequire} from 'node:module'

function loadModuleForTest() {
  switch (process.env.DIST_TEST_TYPE) {
    case 'esm':
      return import('../index.mjs')
    case 'cjs':
      return createRequire(import.meta.url)('../dist/index.cjs')
    default:
      return import('../source/index.js')
  }
}

export default loadModuleForTest
