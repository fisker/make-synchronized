import * as assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import test from 'node:test'
import spawn from 'nano-spawn'
import {temporaryDirectory as getTemporaryDirectory} from 'tempy'

async function run({type}) {
  const directory = getTemporaryDirectory()

  try {
    await spawn('yarn', ['init', '-y'], {cwd: directory})

    const packageJsonFile = path.join(directory, 'package.json')
    const packageJson = JSON.parse(await fs.readFile(packageJsonFile))
    await fs.writeFile(
      packageJsonFile,
      JSON.stringify({...packageJson, type}, undefined, 2),
    )
    await spawn('yarn', ['set', 'version', 'berry'], {cwd: directory})
    await spawn('yarn', {cwd: directory})

    const file = path.join(directory, 'foo.mjs')
    const module = new URL(
      '../fixtures/loaders/yarn-pnp-test.js',
      import.meta.url,
    )
    await fs.writeFile(
      file,
      /* Indent */ `
        import print from ${JSON.stringify(module.href)}
        console.log(JSON.stringify(print(), undefined, 2))
      `,
    )

    return await spawn('yarn', ['node', 'foo.mjs', '--silent'], {
      cwd: directory,
      env: {
        FORCE_COLOR: '0',
        // https://github.com/fisker/make-synchronized/pull/44
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
    })
  } finally {
    await fs.rm(directory, {force: true, recursive: true})
  }
}

test('Yarn PNP', async () => {
  {
    const {stdout, stderr} = await run({type: 'module'})
    assert.equal(stderr, '')
    const result = JSON.parse(stdout)
    assert.equal(result['package.json'].type, 'module')
    assert.equal(result['process.versions.pnp'], '3')
    const NODE_OPTIONS = result['process.env.NODE_OPTIONS']
    assert.ok(
      NODE_OPTIONS.includes('.pnp.cjs'),
      `Expected ${NODE_OPTIONS} to contain '.pnp.cjs'`,
    )
    assert.ok(
      NODE_OPTIONS.includes('.pnp.loader.mjs'),
      `Expected ${NODE_OPTIONS} to contain '.pnp.loader.mjs'`,
    )
  }

  {
    const {stdout, stderr} = await run({type: 'script'})
    assert.equal(stderr, '')
    const result = JSON.parse(stdout)
    assert.equal(result['package.json'].type, 'script')

    assert.equal(result['process.versions.pnp'], '3')
    const NODE_OPTIONS = result['process.env.NODE_OPTIONS']
    assert.ok(
      NODE_OPTIONS.includes('.pnp.cjs'),
      `Expected ${NODE_OPTIONS} to contain '.pnp.cjs'`,
    )
    assert.ok(
      !NODE_OPTIONS.includes('.pnp.loader.mjs'),
      `Expected ${NODE_OPTIONS} to NOT contain '.pnp.loader.mjs'`,
    )
  }
})
