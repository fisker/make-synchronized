import test from 'node:test'
import assert from 'node:assert/strict'
import url from 'node:url'
import makeSynchronized from './index.js'

test('Main', () => {
  const moduleUrl = new URL('./fixtures/async-identity.js', import.meta.url)

  {
    const identity = makeSynchronized(moduleUrl)
    assert.equal(identity(1), 1)
  }

  // Support path
  {
    const identity = makeSynchronized(url.fileURLToPath(moduleUrl))
    assert.equal(identity(2), 2)
  }
})

test('Named exports', () => {
  const proxy = makeSynchronized(new URL('./fixtures/named-exports.js', import.meta.url))
  assert.equal(typeof proxy, 'function')
  assert.notEqual(proxy.default, proxy)
  assert.equal(typeof proxy.default, 'function')
  assert.equal(typeof proxy.foo, 'function')
  assert.equal(typeof proxy.bar, 'function')
  assert.equal(proxy.foo, proxy.foo)
  assert.equal(proxy(), 'default export')
  assert.equal(proxy.default(), 'default export')
  assert.equal(proxy.foo(), 'foo export')
  assert.equal(proxy.bar(), 'bar export')
})

test('Functions', () => {
  const identity = makeSynchronized(async (x) => x);
  assert.equal(identity(1), 1)
})