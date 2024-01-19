import test from 'node:test';
import assert from 'node:assert/strict';
import makeSynchronized from './index.js'

test('Main', () => {
  const identity = makeSynchronized(new URL('./fixtures/async-identity.js', import.meta.url))
  assert.equal(1, 1)
});

test('Main', () => {
  const module = makeSynchronized(new URL('./fixtures/named-exports.js', import.meta.url))
  assert.equal(typeof module, 'function')
  assert.equal(typeof module.default, 'function')
  assert.equal(typeof module.foo, 'function')
  assert.equal(typeof module.bar, 'function')
  assert.equal(module(), 'default export')
  assert.equal(module.default(), 'default export')
  assert.equal(module.foo(), 'foo export')
  assert.equal(module.bar(), 'bar export')
});
