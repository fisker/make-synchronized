import * as assert from 'node:assert/strict'
import * as path from 'node:path'
import test from 'node:test'
import * as url from 'node:url'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeModuleSynchronized} = await loadModuleForTests()

test('module', () => {
  const moduleUrl = new URL(
    '../fixtures/asynchronous-modules/async-identity.js',
    import.meta.url,
  )
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

const invalidModuleTypeError = {
  name: 'TypeError',
  message: /^'module' should be/,
}

test('invalid', () => {
  assert.throws(() => {
    makeModuleSynchronized(/* Invalid module */ true)
  }, invalidModuleTypeError)
  assert.throws(() => {
    makeModuleSynchronized(/* Invalid module */ 0)
  }, invalidModuleTypeError)
  assert.throws(() => {
    makeModuleSynchronized(/* Missing module */)
  }, invalidModuleTypeError)
  assert.throws(() => {
    makeModuleSynchronized(/* Invalid module */ null)
  }, invalidModuleTypeError)
})

const moduleNotFoundError = {
  name: 'Error',
  message: /Cannot find module/,
  code: 'ERR_MODULE_NOT_FOUND',
}
test('non-exists', () => {
  const absolutePath =
    path.sep === '\\'
      ? String.raw`C:\non-exits-module.js`
      : '/non-exits-module.js'
  const moduleUrl = url.pathToFileURL(absolutePath)

  assert.throws(
    () => {
      makeModuleSynchronized(absolutePath)
    },
    moduleNotFoundError,
    `absolute path '${absolutePath}'`,
  )
  assert.throws(() => {
    makeModuleSynchronized({filename: absolutePath})
  }, moduleNotFoundError)
  assert.throws(() => {
    makeModuleSynchronized(moduleUrl)
  }, moduleNotFoundError)
  assert.throws(() => {
    makeModuleSynchronized({href: moduleUrl.href})
  }, moduleNotFoundError)
  assert.throws(() => {
    makeModuleSynchronized({url: moduleUrl.href})
  }, moduleNotFoundError)
})

test('relative path', () => {
  assert.throws(() => {
    makeModuleSynchronized('./non-exits-module.js')
  }, invalidModuleTypeError)
})

const invalidProtocolError = {
  name: 'Error',
  message: /Received protocol/,
  code: 'ERR_UNSUPPORTED_ESM_URL_SCHEME',
}
test('non-supported url', () => {
  assert.throws(() => {
    makeModuleSynchronized('https://example.com')
  }, invalidProtocolError)
  assert.throws(() => {
    makeModuleSynchronized(URL.createObjectURL(new Blob([''])))
  }, invalidProtocolError)
})
