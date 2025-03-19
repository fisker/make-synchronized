import * as assert from 'node:assert/strict'
import test from 'node:test'
import defaultExport, {
  makeDefaultExportSynchronized,
  makeModuleSynchronized,
  makeSynchronized,
  makeSynchronizedFunction,
  makeSynchronizedFunctions,
} from '../source/index.js'

test('Package', () => {
  assert.equal(defaultExport, makeSynchronized)
  assert.equal(typeof makeSynchronized, 'function')
  assert.equal(typeof makeDefaultExportSynchronized, 'function')
  assert.equal(typeof makeDefaultExportSynchronized, 'function')
  assert.equal(typeof makeModuleSynchronized, 'function')
  assert.equal(typeof makeSynchronizedFunction, 'function')
  assert.equal(typeof makeSynchronizedFunctions, 'function')
})
