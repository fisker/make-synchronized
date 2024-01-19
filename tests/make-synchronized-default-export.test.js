import test from 'node:test'
import * as assert from 'node:assert/strict'
import {
  makeSynchronizedDefaultExport,
} from '../index.js'

const synchronize = url => makeSynchronizedDefaultExport(
  new URL(url, import.meta.url)
)

test('makeSynchronizedDefaultExport', () => {
  const identity = synchronize('../fixtures/async-identity.js')
  assert.equal(identity(1n), 1n)

  const defaultExport = synchronize('../fixtures/named-exports.js')
  assert.equal(defaultExport(), 'default export called')

  assert.equal(
    synchronize('../fixtures/default-export-is-a-string.js'),
    'the default export string',
  )

  assert.equal(
    synchronize('../fixtures/empty-module.js'),
    undefined,
  )
})