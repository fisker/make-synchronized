import fs from 'node:fs/promises'

const DEFAULT_ON_RESOLVE_CONCEPTS = {filter: /./, namespace: 'file'}
const DEFAULT_ON_LOAD_CONCEPTS = {
  filter: /\.(?:cjs|js|json|mjs)$/,
  namespace: 'file',
}

function processReplacements(replacements) {
  const onResolveReplacements = new Map()
  const onLoadReplacements = new Map()
  const onLoadProcessors = new Map()

  const checkPathReplaced = (module) => {
    if (!onResolveReplacements.has(module)) {
      return
    }

    throw new Error(`module: '${module}' already replaced with another path.`)
  }

  const checkTextReplaced = (module) => {
    if (!onLoadReplacements.has(module)) {
      return
    }

    throw new Error(
      `module: '${module}' already replaced with another content.`,
    )
  }

  for (const replacement of replacements) {
    const {module} = replacement

    if (typeof module !== 'string') {
      throw new TypeError("'module' option is required.")
    }

    if (
      Object.hasOwn(replacement, 'external') ||
      Object.hasOwn(replacement, 'path')
    ) {
      if (module === '*') {
        throw new Error('Can not replace all modules with the same path.')
      }

      checkPathReplaced(module)

      onResolveReplacements.set(
        module,
        Object.hasOwn(replacement, 'external')
          ? {external: true, path: replacement.external}
          : {path: replacement.path},
      )

      continue
    }

    if (Object.hasOwn(replacement, 'text')) {
      if (module === '*') {
        throw new Error('Can not replace all modules with the same content.')
      }

      checkPathReplaced(module)
      checkTextReplaced(module)

      onLoadReplacements.set(module, {
        contents: replacement.text,
        loader: replacement.loader,
      })

      continue
    }

    checkPathReplaced(module)
    checkTextReplaced(module)

    if (!onLoadProcessors.has(module)) {
      onLoadProcessors.set(module, [])
    }

    const processFunctions = onLoadProcessors.get(module)

    if (Object.hasOwn(replacement, 'process')) {
      const {process} = replacement
      if (typeof process !== 'function') {
        throw new TypeError("'process' option should be a function.")
      }

      processFunctions.push(process)
      continue
    }

    if (
      Object.hasOwn(replacement, 'find') &&
      Object.hasOwn(replacement, 'replacement')
    ) {
      processFunctions.push((text) =>
        text.replaceAll(replacement.find, replacement.replacement),
      )
      continue
    }

    console.log(replacement)
    throw new Error('Unexpected replacement option.')
  }

  return {onResolveReplacements, onLoadReplacements, onLoadProcessors}
}

function setupOnResolveListener(build, {concepts, replacements}) {
  if (replacements.size === 0) {
    return
  }

  // `build.resolve()` will call `onResolve` listener
  // Use a `Set` to avoid infinite loop
  const seenModules = new Set()
  build.onResolve(concepts, async (arguments_) => {
    if (
      !(
        arguments_.kind === 'require-call' ||
        arguments_.kind === 'import-statement' ||
        arguments_.kind === 'dynamic-import'
      )
    ) {
      return
    }

    const key = JSON.stringify(arguments_)
    if (seenModules.has(key)) {
      return
    }
    seenModules.add(key)

    const resolveResult = await build.resolve(arguments_.path, {
      importer: arguments_.importer,
      namespace: arguments_.namespace,
      resolveDir: arguments_.resolveDir,
      kind: arguments_.kind,
      pluginData: arguments_.pluginData,
    })

    // `build.resolve()` seems not respecting `browser` field in `package.json`,
    // `resolveResult` maybe not correct, return `undefined` to let esbuild process the file.
    return replacements.get(resolveResult.path)
  })
}

function setupOnLoadListener(build, {concepts, replacements, processors}) {
  if (replacements.size === 0 && processors.size === 0) {
    return
  }

  const processFunctionsForAllModules = processors.has('*')
    ? processors.get('*')
    : []

  build.onLoad(concepts, async ({path: file}) => {
    if (replacements.has(file)) {
      return replacements.get(file)
    }

    const processFunctions = [
      ...processFunctionsForAllModules,
      ...(processors.has(file) ? processors.get(file) : []),
    ]

    if (processFunctions.length === 0) {
      return
    }

    const original = await fs.readFile(file, 'utf8')

    let text = original
    for (const process of processFunctions) {
      text = process(text, file)
    }

    // For files not JavaScript, we need add correct `loader` to the result,
    // We can simply return `undefined` to let esbuild process the file.
    if (original === text) {
      return
    }

    return {contents: text}
  })
}

export default function esbuildPluginReplaceModule({
  onLoadConcepts = DEFAULT_ON_LOAD_CONCEPTS,
  onResolveConcepts = DEFAULT_ON_RESOLVE_CONCEPTS,
  replacements,
}) {
  const {onResolveReplacements, onLoadReplacements, onLoadProcessors} =
    processReplacements(replacements)
  const onResolveListenerOptions = {
    concepts: onResolveConcepts,
    replacements: onResolveReplacements,
  }
  const onLoadListenerOptions = {
    concepts: onLoadConcepts,
    replacements: onLoadReplacements,
    processors: onLoadProcessors,
  }

  return {
    name: 'replace-module',
    setup(build) {
      setupOnResolveListener(build, onResolveListenerOptions)
      setupOnLoadListener(build, onLoadListenerOptions)
    },
  }
}
