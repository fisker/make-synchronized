import * as path from 'node:path'
import * as url from 'node:url'
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
                "const WORKER_FILE_NAME = 'worker.js'",
                "const WORKER_FILE_NAME = 'worker.mjs'",
              )
              text = text.replace(
                'export const IS_PRODUCTION = false',
                'export const IS_PRODUCTION = true',
              )

              if (format === 'cjs') {
                text = /* Indent */ `
                  import * as path from 'node:path'

                  ${text.replace(
                    'new URL(WORKER_FILE_NAME, import.meta.url)',
                    'path.join(__dirname, WORKER_FILE_NAME)',
                  )}
                `
              }
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
