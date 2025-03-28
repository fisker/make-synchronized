import * as assert from 'node:assert/strict'
import test from 'node:test'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronized, makeInlineFunctionSynchronized} =
  await loadModuleForTests()

const asyncIdentity = (value) => Promise.resolve(value)
const identity = makeSynchronized(asyncIdentity)

const asyncSleep = async (delay) => {
  const {performance} = await import('node:perf_hooks')
  const {setTimeout} = await import('node:timers/promises')

  const startTime = performance.now()
  await setTimeout(delay)
  return performance.now() - startTime
}
const sleep = makeSynchronized(asyncSleep)

test('Inline function', () => {
  assert.equal(identity(1), 1)
  assert.equal(makeInlineFunctionSynchronized(asyncIdentity)(1), 1)
  assert.equal(makeInlineFunctionSynchronized(asyncIdentity.toString())(1), 1)

  const assertInRange = (value, range) => {
    assert.equal(typeof value, 'number')
    assert.ok(value >= range[0])
    assert.ok(value <= range[1])
  }

  assertInRange(sleep(200), [100, 300])
  assertInRange(makeInlineFunctionSynchronized(asyncSleep)(200), [100, 300])
  assertInRange(
    makeInlineFunctionSynchronized(asyncSleep.toString())(200),
    [100, 300],
  )
})

test('Dependencies', () => {
  const result = makeSynchronized(async () => {
    const {version} = await import('prettier')
    return typeof version === 'string'
  })()
  assert.equal(result, true)
})
