import test from 'node:test'
import * as assert from 'node:assert/strict'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronizedFunction} = await loadModuleForTests()

test('makeSynchronizedFunction', () => {
  const double = makeSynchronizedFunction(async (x) => x * 2)
  assert.equal(double(1), 2)
})
