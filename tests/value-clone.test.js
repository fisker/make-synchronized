import test from 'node:test'
import * as assert from 'node:assert/strict'

import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronizedModule} = await loadModuleForTests()

const synchronize = (url) =>
  makeSynchronizedModule(new URL(url, import.meta.url))

test('values', async () => {
  const moduleUrl = new URL('../fixtures/values.js', import.meta.url)
  const synchronized = makeSynchronizedModule(moduleUrl)
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

  assert.ok(synchronized.TIME_NOW instanceof Date)

  assert.throws(
    () => {
      // eslint-disable-next-line no-unused-expressions
      synchronized.NON_TRANSFERABLE
    },
    {name: 'Error', message: 'Cannot serialize worker response.'},
  )
})

test('data to worker', async () => {
  const {default: identity} = synchronize('../fixtures/async-identity.js')
  assert.equal(identity(1), 1)

  assert.throws(
    () => {
      identity(Symbol('Symbol description'))
    },
    {name: 'Error', message: 'Cannot serialize data.'},
  )
})
