import test from 'node:test'
import * as assert from 'node:assert/strict'

test('makeSynchronizedFunction & makeSynchronizedFunctions', async () => {
  const module = await import(
    '../fixtures/making-synchronized-modules/use-make-synchronized-function-and-functions.js'
  )

  assert.equal(module.default(), 'default export called')
  assert.equal(module.foo(), 'foo export called')
  assert.equal(module.bar(), 'bar export called')
})
