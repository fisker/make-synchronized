import * as assert from 'node:assert/strict'
import test from 'node:test'

test('makeSynchronized', async () => {
  {
    const module = await import(
      '../fixtures/making-synchronized-modules/async-identity.js'
    )
    assert.equal(module.default(2), 2)
  }

  {
    const module = await import(
      '../fixtures/making-synchronized-modules/named-exports.js'
    )

    assert.equal(module.default(), 'default export called')
    assert.equal(module.foo(), 'foo export called')
    assert.equal(module.bar(), 'bar export called')
  }
})
