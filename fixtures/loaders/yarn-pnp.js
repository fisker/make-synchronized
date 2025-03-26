import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import process from 'node:process'
import makeSynchronizedFunction from '../../source/index.js'

export default makeSynchronizedFunction(import.meta, async () => ({
  'process.env.NODE_OPTIONS': process.env.NODE_OPTIONS,
  'process.versions.pnp': process.versions.pnp,
  'package.json': JSON.parse(
    await fs.readFile(path.join(process.cwd(), './package.json')),
  ),
}))
