import test from 'node:test'
import * as assert from 'node:assert/strict'

test('makeSynchronizedDefaultSpecifier', async () => {
  {
    const {default: identity} = await import(
      '../fixtures/export-synchronized-function-as-default.js'
    )
    assert.equal(identity(1), 1)
  }

  {
    const {default: defaultExport} = await import(
      '../fixtures/export-synchronized-named-exports.js'
    )
    assert.equal(defaultExport.identity(1), 1)
    assert.equal(typeof defaultExport.symbol, 'symbol')
  }
})
