import test from 'node:test'
import * as assert from 'node:assert/strict'
import {makeSynchronizedModule} from '../index.js'

test('Performance', () => {
  const iteration = 2000
  const module = new URL('../fixtures/async-identity.js', import.meta.url)
  const result = []
  const startTime = performance.now()
  for (let index = 0; index < iteration; index++) {
    result.push(makeSynchronizedModule(module).default(index))
  }
  const time = performance.now() - startTime
  assert.equal(result.length, iteration, 'Incorrect result')
  assert.equal(result.at(100), 100, 'Incorrect result')
  assert.ok(time < 1000, `Too slow, ${time}ms`)
})
