import test from 'node:test'
import * as assert from 'node:assert/strict'
import * as url from 'node:url'
import * as path from 'node:path'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeModuleSynchronized} = await loadModuleForTests()

test('module', () => {
  const moduleUrl = new URL('../fixtures/async-identity.js', import.meta.url)
  const modulePath = url.fileURLToPath(moduleUrl)
  assert.equal(makeModuleSynchronized(moduleUrl).default('foo'), 'foo')
  assert.equal(makeModuleSynchronized(modulePath).default('bar'), 'bar')
})

test('built-module', () => {
  const {readFile} = makeModuleSynchronized('node:fs/promises')
  assert.ok(
    // A-comment-to-check-current-file-successfully-read
    readFile(url.fileURLToPath(import.meta.url), 'utf8').includes(
      'A-comment-to-check-current-file-successfully-read',
    ),
  )
  assert.ok(makeModuleSynchronized('node:path').sep, path.sep)
})

test('invalid', () => {
  assert.throws(
    () => {
      makeModuleSynchronized(/* Invalid module */ true)
    },
    {name: 'Error'},
  )
  assert.throws(
    () => {
      makeModuleSynchronized(/* Missing module */)
    },
    {name: 'Error'},
  )
  assert.throws(
    () => {
      makeModuleSynchronized('/non-exits-module.js')
    },
    {name: 'Error'},
  )
})
