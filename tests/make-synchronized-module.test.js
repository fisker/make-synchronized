import test from 'node:test'
import * as assert from 'node:assert/strict'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronizedModule} = await loadModuleForTests()

const synchronize = (url) =>
  makeSynchronizedModule(new URL(url, import.meta.url))

test('makeSynchronizedModule', () => {
  const module = synchronize('../fixtures/named-exports.js')
  assert.deepEqual(Object.keys(module).sort(), ['default', 'foo', 'bar'].sort())
  assert.deepEqual(module.default(), 'default export called')
  assert.deepEqual(module.foo(), 'foo export called')
})
