import * as assert from 'node:assert/strict'
import * as path from 'node:path'
import test from 'node:test'
import * as url from 'node:url'
import makeSynchronized from '../../scripts/module-proxy.js'

test('module', () => {
  const moduleUrl = new URL(
    '../fixtures/asynchronous-modules/async-identity.js',
    import.meta.url,
  )
  const modulePath = url.fileURLToPath(moduleUrl)
  assert.equal(makeSynchronized(moduleUrl).default('foo'), 'foo')
  assert.equal(makeSynchronized(modulePath).default('bar'), 'bar')
})

test('built-module', () => {
  const {readFile} = makeSynchronized('node:fs/promises')
  assert.ok(
    // A-comment-to-check-current-file-successfully-read
    readFile(url.fileURLToPath(import.meta.url), 'utf8').includes(
      'A-comment-to-check-current-file-successfully-read',
    ),
  )
  assert.ok(makeSynchronized('node:path').sep, path.sep)
})

test('invalid', () => {
  assert.throws(
    () => {
      makeSynchronized(/* Invalid module */ true)
    },
    {name: 'Error'},
  )
  assert.throws(
    () => {
      makeSynchronized(/* Missing module */)
    },
    {name: 'Error'},
  )
  assert.throws(
    () => {
      makeSynchronized('/non-exits-module.js')
    },
    {name: 'Error'},
  )
})
