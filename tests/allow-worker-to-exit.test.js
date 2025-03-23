import * as assert from 'node:assert/strict'
import test from 'node:test'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeModuleSynchronized} = await loadModuleForTests()
const delay = (time) =>
  new Promise((resolve) => {
    globalThis.setTimeout(() => {
      resolve()
    }, time)
  })

test('makeModuleSynchronized', async () => {
  const module = makeModuleSynchronized(
    new URL(
      '../fixtures/asynchronous-modules/allow-worker-to-exit.js',
      import.meta.url,
    ),
  )

  assert.equal(module.identity(1), 1)
  module.exit()
  assert.equal(module.identity(2), 2)
  module.setExitCode()
  assert.equal(module.identity(3), 3)

  assert.equal(module.identity(4), 4)
  module.exit()
  await delay(500)
  assert.equal(module.identity(5), 5)
  module.setExitCode()
  await delay(500)
  assert.equal(module.identity(6), 6)
})
