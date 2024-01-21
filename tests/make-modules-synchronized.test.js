import test from 'node:test'
import * as assert from 'node:assert/strict'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronized} = await loadModuleForTests()

const synchronize = (url) => makeSynchronized(new URL(url, import.meta.url))

test('makeSynchronized', () => {
  {
    const module = synchronize(
      '../fixtures/asynchronous-modules/async-identity.js',
    )
    assert.equal(module.default, module.default, 'Should be cached')
    assert.equal(module.default('foo'), 'foo')
    assert.equal(module.nonExistsSpecifier, undefined)
  }

  {
    const module = synchronize(
      '../fixtures/asynchronous-modules/named-exports.js',
    )
    assert.equal(module.default(), 'default export called')
    assert.equal(module.foo(), 'foo export called')
    assert.equal(module.bar(), 'bar export called')
    assert.equal(module.nonExistsSpecifier, undefined)
  }
})

test('makeSynchronized() default export is a function', () => {
  const module = synchronize(
    '../fixtures/asynchronous-modules/named-exports.js',
  )
  assert.equal(typeof module, 'function')
  assert.equal(typeof module.foo, 'function')
})

test('makeSynchronized() default export is NOT a function', () => {
  const module = synchronize('../fixtures/asynchronous-modules/values.js')
  assert.equal(typeof module, 'object')
  assert.equal(Object.prototype.toString.call(module), '[object Module]')
  assert.equal(module.toString, undefined)
  assert.equal(module.NUMBER_ONE, 1)
})
