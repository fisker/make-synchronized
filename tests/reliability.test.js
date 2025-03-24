import * as assert from 'node:assert/strict'
import process from 'node:process'
import test from 'node:test'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronized} = await loadModuleForTests()
const synchronize = (url) => makeSynchronized(new URL(url, import.meta.url))

const times = process.env.CI ? 1e6 : 1e5
test(`reliability(${times} runs)`, async () => {
  const {default: identity} = synchronize(
    '../fixtures/asynchronous-modules/async-identity.js',
  )

  for (let index = 0; index < times; index++) {
    assert.equal(identity(index), index)
  }
})
