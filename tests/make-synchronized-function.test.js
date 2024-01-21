import test from 'node:test'
import * as assert from 'node:assert/strict'
import loadModuleForTest from '../scripts/load-module-for-test.js'

const {makeSynchronizedFunction} = await loadModuleForTest()

test('makeSynchronizedFunction', () => {
  const double = makeSynchronizedFunction(async (x) => x * 2)
  assert.equal(double(1), 2)
})
