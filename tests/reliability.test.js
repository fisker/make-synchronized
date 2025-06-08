import * as assert from 'node:assert/strict'
import process from 'node:process'
import test from 'node:test'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronized} = await loadModuleForTests()
const synchronize = (url) => makeSynchronized(new URL(url, import.meta.url))

const iterations = process.env.CI ? 1e6 : 1e4
test(`reliability(${iterations} iterations)`, async () => {
  const {default: identity} = synchronize(
    '../fixtures/asynchronous-modules/async-identity.js',
  )

  for (let index = 0; index < iterations; index++) {
    try {
      assert.equal(identity(index), index)
    } catch (error) {
      console.log(`Failed on ${index + 1}/${iterations} run.`)
      throw error
    }
  }
})
