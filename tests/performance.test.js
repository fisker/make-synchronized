import * as assert from 'node:assert/strict'
import test from 'node:test'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeModuleSynchronized} = await loadModuleForTests()

function runRepeatedly(function_, iterations) {
  const startTime = performance.now()

  const result = []
  for (let iteration = 0; iteration < iterations; iteration++) {
    result.push(function_(iteration))
  }

  const time = performance.now() - startTime

  return {result, time}
}

test('Performance', () => {
  const iterations = 500
  const module = new URL(
    '../fixtures/asynchronous-modules/async-identity.js',
    import.meta.url,
  )

  const {result, time: totalTime} = runRepeatedly(
    (iteration) => makeModuleSynchronized(module).default(iteration),
    iterations,
  )

  assert.equal(result.length, iterations, 'Incorrect result')
  assert.equal(result.at(33), 33, 'Incorrect result')
  assert.ok(totalTime < 1000, `Too slow, ${totalTime}ms`)

  const identity = makeModuleSynchronized(module).default
  const {time: runTime} = runRepeatedly(
    (iteration) => identity(iteration),
    iterations,
  )
  assert.ok(runTime < 500, `Too slow, ${runTime}ms`)
})
