import * as assert from 'node:assert/strict'
import test from 'node:test'
import {data} from '../fixtures/asynchronous-modules/throws.js'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronized} = await loadModuleForTests()
const synchronize = (url) => makeSynchronized(new URL(url, import.meta.url))

test('throws', () => {
  const reject = synchronize('../fixtures/asynchronous-modules/throws.js')
  const getError = (name) => {
    try {
      reject(name)
    } catch (error) {
      return error
    }
  }

  for (const [name, expected] of data) {
    if (name === 'symbol') {
      assert.throws(
        () => {
          reject(name)
        },
        {name: 'Error', message: /Cannot serialize worker response:/},
      )

      continue
    }

    const value = getError(name)
    assert.equal(value, expected)
  }
})
