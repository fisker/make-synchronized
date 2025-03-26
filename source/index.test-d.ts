import defaultExport, {
  makeDefaultExportSynchronized,
  makeModuleSynchronized,
  makeSynchronized,
  makeSynchronizedFunction,
  makeSynchronizedFunctions,
  makeInlineFunctionSynchronized,
} from './index.js'

import {expectError, expectType} from 'tsd'

{
  // `makeSynchronized` is the same as default export
  expectType<typeof makeSynchronized>(defaultExport)
}

{
  // No default export
  expectType<number>(makeSynchronized<{foo: () => Promise<number>}>('x').foo())
  expectType<number>(makeSynchronized<{foo: () => number}>('x').foo())
  expectType<number>(makeSynchronized<{foo: Promise<number>}>('x').foo)
  expectType<number>(makeSynchronized<{foo: number}>('x').foo)

  // Default export is a function
  expectType<number>(makeSynchronized<{default: () => Promise<number>}>('x')())
  expectType<number>(makeSynchronized<{default: () => number}>('x')())
  expectType<number>(
    makeSynchronized<{default: () => number; foo: () => Promise<number>}>(
      'x',
    ).foo(),
  )
  expectType<number>(
    makeSynchronized<{default: () => number; foo: () => number}>('x').foo(),
  )
  expectType<number>(
    makeSynchronized<{default: () => number; foo: Promise<number>}>('x').foo,
  )
  expectType<number>(
    makeSynchronized<{default: () => number; foo: number}>('x').foo,
  )

  // Default export is not function
  expectType<number>(makeSynchronized<{default: Promise<number>}>('x').default)
  expectType<number>(makeSynchronized<{default: number}>('x').default)
  expectType<number>(
    makeSynchronized<{default: number; foo: () => Promise<number>}>('x').foo(),
  )
  expectType<number>(
    makeSynchronized<{default: number; foo: () => number}>('x').foo(),
  )
  expectType<number>(
    makeSynchronized<{default: number; foo: Promise<number>}>('x').foo,
  )
  expectType<number>(makeSynchronized<{default: number; foo: number}>('x').foo)

  // Inline functions
  expectType<1>(makeSynchronized(async () => 1 as const)())
}

// Module argument
{
  const synchronize = (module: Parameters<typeof makeSynchronized>[0]) =>
    makeSynchronized<{foo: () => Promise<number>}>(module).foo()
  expectType<number>(synchronize('/path/to/module'))
  expectType<number>(synchronize(new URL('file:///path/to/module')))
  expectType<number>(synchronize(new URL('file:///path/to/module').href))
  expectType<number>(synchronize({href: 'file:///path/to/module'}))
  expectType<number>(synchronize(import.meta))
  expectType<number>(synchronize(import.meta.url))
  expectType<number>(synchronize({url: 'file:///path/to/module'}))
  expectType<number>(synchronize({filename: '/path/to/module'}))
}

{
  // For exports
  expectType<number>(makeSynchronized('foo', async () => 1)())
  expectType<number>(makeSynchronized('foo', () => 1)())
  expectType<number>(makeSynchronized('foo', {foo: async () => 1}).foo())
  expectType<number>(makeSynchronized('foo', {foo: (): number => 1}).foo())
}

// `makeSynchronizedFunction`
{
  const function_ = async () => 1 as const
  expectType<1>(makeSynchronizedFunction(import.meta, function_)())
  expectType<1>(makeSynchronizedFunction(import.meta, function_, 'default')())
  expectType<1>(
    makeSynchronizedFunction(import.meta, function_, ['foo', 'bar'])(),
  )
  expectError(() => makeSynchronizedFunction(import.meta, () => 1))
  expectError(() => makeSynchronizedFunction(import.meta, () => 1, 'foo'))
  expectError(() => makeSynchronizedFunction(import.meta, function_, true))
}

// `makeSynchronizedFunctions`
{
  const functions = {
    foo: async () => 1 as const,
    bar() {
      return 2 as const
    },
    baz: 3,
  }
  expectType<1>(makeSynchronizedFunctions(import.meta, functions).foo())
  expectType<2>(makeSynchronizedFunctions(import.meta, functions).bar())
  expectError(() => makeSynchronizedFunctions(import.meta, 0))
}

// `makeDefaultExportSynchronized`
{
  expectType<number>(
    makeDefaultExportSynchronized<{default: () => Promise<number>}>('x')(),
  )
  expectType<number>(
    makeDefaultExportSynchronized<{default: () => number}>('x')(),
  )
  expectError(() =>
    makeDefaultExportSynchronized<{foo: () => Promise<number>}>('x'),
  )
  expectError(() => makeDefaultExportSynchronized<{default: number}>('x'))
}

// `makeModuleSynchronized`
{
  expectType<number>(
    makeModuleSynchronized<{default: () => Promise<number>}>('x').default(),
  )
  expectType<number>(
    makeModuleSynchronized<{foo: () => Promise<number>}>('x').foo(),
  )
  expectError(() =>
    makeModuleSynchronized<{default: () => Promise<number>}>('x')(),
  )
}

// `makeInlineFunctionSynchronized`
{
  expectType<1>(makeInlineFunctionSynchronized(async () => 1 as const)())
  expectType<'lie'>(
    makeInlineFunctionSynchronized<(...argumentsList: any[]) => Promise<'lie'>>(
      `async () => 1`,
    )(),
  )
}
