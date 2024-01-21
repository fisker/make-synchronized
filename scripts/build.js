import * as url from 'node:url'
import * as path from 'node:path'

import * as esbuild from 'esbuild'
import esbuildPluginReplaceModule from './esbuild-plugin-replace-module.js'

const toPath = (file) => url.fileURLToPath(new URL(file, import.meta.url))

async function build(file, {format}) {
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
                'export const IS_DEVELOPMENT = true',
                'export const IS_DEVELOPMENT = false',
              )
              if (format === 'cjs') {
                text = text.replace(
                  "export const WORKER_FILE = new URL('./worker.js', import.meta.url)",
                  /* Indent */ `
                    import * as __path from "node:path"
                    export const WORKER_FILE = __path.join(__dirname, './worker.cjs')
                  `,
                )
              }
              return text
            },
          },
        ],
      }),
    ],
  })
}

await Promise.all(
  ['../source/index.js', '../source/worker.js'].flatMap((file) =>
    [
      {format: 'esm', WORKER_FILE: 'undefined'},
      {format: 'cjs', WORKER_FILE: 'require.resolve("./worker.cjs")'},
    ].map((options) => build(file, options)),
  ),
)

console.log('✅ Build success.')
