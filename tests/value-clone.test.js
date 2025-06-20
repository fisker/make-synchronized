import * as assert from 'node:assert'
import test from 'node:test'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeModuleSynchronized} = await loadModuleForTests()

const synchronize = (url) =>
  makeModuleSynchronized(new URL(url, import.meta.url))

test('values', async () => {
  const moduleUrl = new URL(
    '../fixtures/asynchronous-modules/values.js',
    import.meta.url,
  )
  const synchronized = makeModuleSynchronized(moduleUrl)
  const dynamic = await import(moduleUrl)

  assert.deepEqual(Object.keys(synchronized), Object.keys(dynamic))
  assert.equal(synchronized.NUMBER_POSITIVE_ZERO, 0)
  assert.equal(synchronized.NUMBER_NEGATIVE_ZERO, -0)
  assert.ok(Object.is(synchronized.NUMBER_NEGATIVE_ZERO, -0))
  assert.ok(!Object.is(synchronized.NUMBER_NEGATIVE_ZERO, 0))
  assert.equal(synchronized.NUMBER_ONE, 1)
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
  assert.equal(synchronized.OBJECT_NULL, null)
  assert.deepEqual(synchronized.OBJECT_EMPTY, {})
  assert.deepEqual(synchronized.OBJECT_FISKER_IS_JERK, {fisker: 'jerk'})
  assert.deepEqual(synchronized.OBJECT_NULL_PROTOTYPE, Object.create(null))
  assert.equal(Object.getPrototypeOf(synchronized.OBJECT_NULL_PROTOTYPE), null)

  assert.ok(synchronized.TIME_NOW instanceof Date)

  assert.ok(synchronized.REGEXP_WITH_LAST_INDEX instanceof RegExp)
  assert.equal(synchronized.REGEXP_WITH_LAST_INDEX.lastIndex, 0)
  assert.equal(dynamic.REGEXP_WITH_LAST_INDEX.lastIndex, 11)
  assert.equal(
    synchronized.REGEXP_WITH_LAST_INDEX.source,
    dynamic.REGEXP_WITH_LAST_INDEX.source,
  )

  assert.throws(() => synchronized.NON_DATA_CLONEABLE, {
    name: 'Error',
    message: /Cannot serialize worker response:/,
  })
})

test('data to worker', async () => {
  const {default: identity} = synchronize(
    '../fixtures/asynchronous-modules/async-identity.js',
  )
  assert.equal(identity(1), 1)

  assert.throws(
    () => {
      identity(Symbol('Symbol description'))
    },
    {name: 'DataCloneError', message: /^Cannot serialize request data:/},
  )
})
