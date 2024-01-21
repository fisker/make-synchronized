import test from 'node:test'
import * as assert from 'node:assert/strict'
import defaultExport, {
  makeSynchronized,
  makeDefaultExportSynchronized,
  makeModuleSynchronized,
} from '../source/index.js'

test('Package', () => {
  assert.equal(defaultExport, makeSynchronized)
  assert.equal(typeof makeSynchronized, 'function')
  assert.equal(typeof makeDefaultExportSynchronized, 'function')
  assert.equal(typeof makeDefaultExportSynchronized, 'function')
  assert.equal(typeof makeModuleSynchronized, 'function')
})
