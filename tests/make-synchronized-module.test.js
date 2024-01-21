import test from 'node:test'
import * as assert from 'node:assert/strict'
import loadModuleForTest from '../scripts/load-module-for-test.js'

const {makeSynchronizedModule} = await loadModuleForTest()

const synchronize = (url) =>
  makeSynchronizedModule(new URL(url, import.meta.url))

test('makeSynchronizedModule', () => {
  const module = synchronize('../fixtures/named-exports.js')
  assert.deepEqual(Object.keys(module).sort(), ['default', 'foo', 'bar'].sort())
  assert.deepEqual(module.default(), 'default export called')
  assert.deepEqual(module.foo(), 'foo export called')
})
