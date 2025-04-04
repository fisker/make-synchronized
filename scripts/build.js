import assert from 'node:assert'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as url from 'node:url'
import * as esbuild from 'esbuild'
import esbuildPluginReplaceModule from './esbuild-plugin-replace-module.js'

const toPath = (file) => url.fileURLToPath(new URL(file, import.meta.url))

const replaceConstantsWithNumbers = (text) => {
  const constants = new Map()
  for (const {
    groups: {string, constant},
  } of text.matchAll(
    /(?<string>(?<quote>["'])\[\[(?<constant>[_A-Z]+)\]\]\k<quote>)/g,
  )) {
    const [type, member] = constant.split('__')
    if (!constants.has(type)) {
      constants.set(type, {strings: new Set(), members: new Set()})
    }

    const {strings, members} = constants.get(type)
    strings.add({string, member})
    members.add(member)
  }

  for (const [, {strings, members}] of constants) {
    const membersArray = [...members]
    for (const {string, member} of strings) {
      const value = membersArray.indexOf(member)
      assert.ok(value !== -1)
      text = text.replaceAll(string, value + 1)
    }
  }

  assert.ok(!text.includes('[['))
  return text
}

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
                'export const IS_PRODUCTION = false',
                'export const IS_PRODUCTION = true',
              )

              text = replaceConstantsWithNumbers(text)

              return text
            },
          },
          format === 'cjs' && {
            module: toPath('../source/index.js'),
            process: (text) =>
              text.replace('new URL(import.meta.url)', '__filename'),
          },
        ].filter(Boolean),
      }),
    ],
  })
}

await Promise.all([
  build('../source/index.js'),
  build('../source/index.js', {format: 'cjs'}),
  fs.copyFile(
    new URL('../source/index.d.ts', import.meta.url),
    new URL('../index.d.ts', import.meta.url),
  ),
])

console.log('✅ Build success.')
