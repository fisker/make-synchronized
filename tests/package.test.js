import test from 'node:test'
import * as assert from 'node:assert/strict'
import defaultExport, {
  makeSynchronized,
  makeSynchronizedDefaultExport,
  makeSynchronizedFunction,
  makeSynchronizedModule,
} from '../source/index.js'

test('Package', () => {
  assert.equal(defaultExport, makeSynchronized)
  assert.equal(typeof makeSynchronized, 'function')
  assert.equal(typeof makeSynchronizedDefaultExport, 'function')
  assert.equal(typeof makeSynchronizedFunction, 'function')
  assert.equal(typeof makeSynchronizedDefaultExport, 'function')
  assert.equal(typeof makeSynchronizedModule, 'function')
})
