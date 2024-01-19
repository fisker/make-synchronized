type AnyFunction = (...args: any[]) => any

type SynchronizedFunction<Fn extends AnyFunction> = (...args: Parameters<Fn>) => Awaited<ReturnType<Fn>>

type SynchronizedModule<Module extends {}, EntryPoint extends keyof Module | 'default'> = {
  [K in keyof Module as Module[K] extends AnyFunction ? K : never]: Module[K] extends AnyFunction ? SynchronizedFunction<Module[K]> : never
} & (EntryPoint extends keyof Module
    ? Module[EntryPoint] extends AnyFunction
      ? SynchronizedFunction<Module[EntryPoint]>
      : {}
    : {})

/**
 * Make a function or module synchronized.
 * 
 * @example
 * const identity = makeSynchronized(async (x) => x)
 * const module = makeSynchronized<typeof import('./async.js')>(new URL('./async.js', import.meta.url))
 * const module = makeSynchronized<typeof import('./async.js')>(new URL('./async.js', import.meta.url), 'entryPoint')
 */
declare function makeSynchronized<Fn extends AnyFunction>(fn: Fn): SynchronizedFunction<Fn>;
declare function makeSynchronized<Module extends {}, EntryPoint extends keyof Module | 'default'  = 'default'>(module: URL | string, entryPoint?: EntryPoint): SynchronizedModule<Module, EntryPoint>;

export default makeSynchronized
