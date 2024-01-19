import test from 'node:test'
import * as assert from 'node:assert/strict'
import {makeSynchronizedFunction} from '../index.js'

test('makeSynchronizedFunction', () => {
  const double = makeSynchronizedFunction(async (x) => x * 2)
  assert.equal(double(1), 2)
})
