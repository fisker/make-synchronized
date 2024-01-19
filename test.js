import test from 'node:test'
import assert from 'node:assert/strict'
import url from 'node:url'
import makeSynchronized from './index.js'

test('Main', () => {
  const moduleUrl = new URL('./fixtures/async-identity.js', import.meta.url)
  {
    const {default: identity} = makeSynchronized(moduleUrl)
    assert.equal(identity(1), 1)
  }

  {
    const {default: identity} = makeSynchronized(url.fileURLToPath(moduleUrl))
    assert.equal(identity(1), 1)
  }
})

test('Named exports', () => {
  const module = makeSynchronized(new URL('./fixtures/named-exports.js', import.meta.url))
  assert.equal(typeof module.default, 'function')
  assert.equal(typeof module.foo, 'function')
  assert.equal(typeof module.bar, 'function')
  assert.equal(module.foo, module.foo)
  assert.equal(module.default(), 'default export')
  assert.equal(module.foo(), 'foo export')
  assert.equal(module.bar(), 'bar export')
  assert.equal(module.nonExitsSpecifier, undefined)
  assert.throws(() => {
    module.nonExitsSpecifier()
  }, {name: 'TypeError', message: 'module.nonExitsSpecifier is not a function'})
})

test('Properties', async () => {
  const moduleUrl = new URL('./fixtures/properties.js', import.meta.url)
  const synchronized = makeSynchronized(moduleUrl)
  const dynamic = await import(moduleUrl)

  assert.deepEqual(Object.keys(synchronized), Object.keys(dynamic))
  assert.ok(Object.is(synchronized.NUMBER_POSITIVE_ZERO, 0))
  assert.ok(Object.is(synchronized.NUMBER_NEGATIVE_ZERO, -0))
  assert.equal(synchronized.NUMBER_NEGATIVE_ONE, 1)
  assert.equal(synchronized.NUMBER_POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
  assert.equal(synchronized.NUMBER_NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)
  assert.equal(synchronized.NUMBER_NAN, Number.NaN)

  assert.equal(synchronized.BIGINT_ZERO, 0n)
  assert.equal(synchronized.BIGINT_FOUR_HUNDRED_NINES, BigInt('9'.repeat(400)))

  assert.equal(synchronized.STRING_EMPTY, '')
  assert.equal(synchronized.STRING_FOO, 'FOO')


  assert.equal(synchronized.BOOLEAN_TRUE, true)
  assert.equal(synchronized.BOOLEAN_FALSE, false)

  assert.ok(synchronized.ERROR_SYNTAXERROR instanceof SyntaxError)
  assert.equal(synchronized.ERROR_SYNTAXERROR.message, 'message')
  
  assert.deepEqual(synchronized.ARRAY_EMPTY, [])
  assert.deepEqual(synchronized.ARRAY_TWO_ZEROS, [0, 0])

  assert.equal(typeof synchronized.OBJECT_UNDEFINED, 'undefined')
  assert(typeof synchronized.OBJECT_NULL, null)
  assert.deepEqual(synchronized.OBJECT_EMPTY, {})
  assert.deepEqual(synchronized.OBJECT_FISKER_IS_JERK, {fisker: 'jerk'})

  assert.ok(synchronized.TIME_NOW instanceof Date)

  assert.throws(() => {
    synchronized.NON_TRANSFERABLE
  }, {name: 'Error' /** TODO: Improve this test */})
})

test('Functions', () => {
  const identity = makeSynchronized(async (x) => x);
  assert.equal(identity(1), 1)
})

test('Errors', () => {
  assert.throws(() => {
    makeSynchronized(/* Invalid module */ true)
  },{name: 'Error'})
  assert.throws(() => {
    makeSynchronized('/non-exits-module.js')
  },{name: 'Error'})
})