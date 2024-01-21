import test from 'node:test'
import * as assert from 'node:assert/strict'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeDefaultExportSynchronized} = await loadModuleForTests()

const synchronize = (url) =>
  makeDefaultExportSynchronized(new URL(url, import.meta.url))

test('makeDefaultExportSynchronized', () => {
  const identity = synchronize(
    '../fixtures/asynchronous-modules/async-identity.js',
  )
  assert.equal(identity(1n), 1n)

  const defaultExport = synchronize(
    '../fixtures/asynchronous-modules/named-exports.js',
  )
  assert.equal(defaultExport(), 'default export called')

  assert.equal(
    synchronize(
      '../fixtures/asynchronous-modules/default-export-is-a-string.js',
    ),
    'the default export string',
  )

  assert.equal(
    synchronize('../fixtures/asynchronous-modules/empty-module.js'),
    undefined,
  )
})
