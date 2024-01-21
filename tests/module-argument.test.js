import test from 'node:test'
import * as assert from 'node:assert/strict'
import * as url from 'node:url'
import * as path from 'node:path'
import loadModuleForTest from '../scripts/load-module-for-test.js'

const {makeSynchronizedModule} = await loadModuleForTest()

test('module', () => {
  const moduleUrl = new URL('../fixtures/async-identity.js', import.meta.url)
  const modulePath = url.fileURLToPath(moduleUrl)
  assert.equal(makeSynchronizedModule(moduleUrl).default('foo'), 'foo')
  assert.equal(makeSynchronizedModule(modulePath).default('bar'), 'bar')
})

test('built-module', () => {
  const {readFile} = makeSynchronizedModule('node:fs/promises')
  assert.ok(
    // A-comment-to-check-current-file-successfully-read
    readFile(url.fileURLToPath(import.meta.url), 'utf8').includes(
      'A-comment-to-check-current-file-successfully-read',
    ),
  )
  assert.ok(makeSynchronizedModule('node:path').sep, path.sep)
})

test('invalid', () => {
  assert.throws(
    () => {
      makeSynchronizedModule(/* Invalid module */ true)
    },
    {name: 'Error'},
  )
  assert.throws(
    () => {
      makeSynchronizedModule(/* Missing module */)
    },
    {name: 'Error'},
  )
  assert.throws(
    () => {
      makeSynchronizedModule('/non-exits-module.js')
    },
    {name: 'Error'},
  )
})
