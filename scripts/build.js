import * as url from 'node:url'
import * as path from 'node:path'

import * as esbuild from 'esbuild'
import esbuildPluginReplaceModule from './esbuild-plugin-replace-module.js'

const toPath = (file) => url.fileURLToPath(new URL(file, import.meta.url))

async function build(file, {format = 'esm'} = {}) {
  const input = toPath(file)
  const basename = path.basename(input, '.js')
  const extension = format === 'cjs' ? '.cjs' : '.mjs'
  const output = toPath(`../${basename}${extension}`)

  await esbuild.build({
    entryPoints: [input],
    bundle: true,
    platform: 'node',
    format,
    outfile: output,
    plugins: [
      esbuildPluginReplaceModule({
        replacements: [
          {
            module: toPath('../source/constants.js'),
            process(text) {
              text = text.replace(
                "export const WORKER_FILE = new URL('./worker.js', import.meta.url)",
                format === 'esm'
                  ? "export const WORKER_FILE = new URL('./worker.mjs', import.meta.url)"
                  : /* Indent */ `
                    import * as __path from "node:path"
                    export const WORKER_FILE = __path.join(__dirname, './worker.mjs')
                  `,
              )
              return text
            },
          },
        ],
      }),
    ],
  })
}

await Promise.all([
  build('../source/index.js'),
  build('../source/worker.js'),
  build('../source/index.js', {format: 'cjs'}),
])

console.log('✅ Build success.')
