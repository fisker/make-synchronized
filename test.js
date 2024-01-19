import test from 'node:test';
import assert from 'node:assert/strict';
import makeSynchronized from './index.js'

test('Main', () => {
  const identity = makeSynchronized(new URL('./fixtures/async-identity.js', import.meta.url))
  assert.equal(1, 1)
});
