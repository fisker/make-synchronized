import * as assert from 'node:assert/strict'
import process from 'node:process'
import test from 'node:test'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronized} = await loadModuleForTests()

;(process.features.typescript ? test : test.skip)('typescript', () => {
  const identity = makeSynchronized(
    new URL(
      '../fixtures/typescript-modules/async-identity.ts',
      import.meta.url,
    ),
  )

  assert.equal(identity(1n), 1n)
})
