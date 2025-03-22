import {makeModuleSynchronized, makeSynchronized} from './types.d'
import {AsynchronousFunction} from './types'
type Module = string | URL | ImportMeta
type NormalizedPropertyPath = string[]
type PropertyPath = undefined | string | NormalizedPropertyPath

type AsynchronousFunction = (...args: unknown[]) => Promise<unknown>
type AsynchronousFunctions = Record<string, AsynchronousFunction>
type ModuleExportImplementation = AsynchronousFunctions | AsynchronousFunction
type SynchronizedFunction<
  InputAsynchronousFunction extends AsynchronousFunction = AsynchronousFunction,
> = (
  ...argumentsList: Parameters<InputAsynchronousFunction>[]
) => Awaited<ReturnType<InputAsynchronousFunction>>
type SynchronizedFunctions<
  InputAsynchronousFunctions extends
    AsynchronousFunctions = AsynchronousFunctions,
> = {
  [Key in keyof InputAsynchronousFunctions]: SynchronizedFunction<
    InputAsynchronousFunctions[Key]
  >
}
type SynchronizedModule<InputNodeModule = Record<string, unknown>> = {
  [Key in keyof InputNodeModule]: InputNodeModule[Key] extends AsynchronousFunction
    ? SynchronizedFunction<InputNodeModule[Key]>
    : InputNodeModule[Key]
}
type NodeModule = Record<string, unknown>
type NodeModuleWithAsynchronousFunctionDefaultExport = NodeModule & {
  default: AsynchronousFunction
}

type SynchronizedDefaultExportProxy<
  InputNodeModule extends
    NodeModuleWithAsynchronousFunctionDefaultExport = NodeModuleWithAsynchronousFunctionDefaultExport,
> = SynchronizedFunction<InputNodeModule['default']> &
  SynchronizedModule<InputNodeModule>

export type MakeSynchronized = {
  (
    module: Module,
    implementation: ModuleExportImplementation,
  ): typeof implementation extends AsynchronousFunction
    ? SynchronizedFunction<typeof implementation>
    : typeof implementation extends AsynchronousFunctions
      ? SynchronizedFunctions<typeof implementation>
      : never

  <InputNodeModule = Record<string, unknown>>(
    module: Module,
  ): InputNodeModule extends NodeModuleWithAsynchronousFunctionDefaultExport
    ? SynchronizedDefaultExportProxy<InputNodeModule>
    : SynchronizedModule<InputNodeModule>
}

export type MakeDefaultExportSynchronized<
  InputNodeModule extends
    NodeModuleWithAsynchronousFunctionDefaultExport = NodeModuleWithAsynchronousFunctionDefaultExport,
> = (module: Module) => SynchronizedFunction<InputNodeModule['default']>

export type MakeModuleSynchronized<
  InputNodeModule extends NodeModule = NodeModule,
> = (module: Module) => SynchronizedModule<InputNodeModule>

export type MakeSynchronizedFunction<
  InputAsynchronousFunctions extends
    AsynchronousFunction = AsynchronousFunction,
> = (
  module: Module,
  implementation: InputAsynchronousFunctions,
  specifier?: PropertyPath,
) => SynchronizedFunction<InputAsynchronousFunctions>

export type MakeSynchronizedFunctions<
  InputAsynchronousFunctions extends
    AsynchronousFunctions = AsynchronousFunctions,
> = (
  module: Module,
  implementation: InputAsynchronousFunctions,
  specifier?: PropertyPath,
) => SynchronizedFunctions<InputAsynchronousFunctions>

/**
Make a function or module synchronized.

@example
```js
import makeSynchronized from 'make-synchronized'

const synchronizedFoo = makeSynchronized<typeof import('foo')>('foo')
```

@example
```js
import makeSynchronized from 'make-synchronized'

export default makeSynchronized(import.meta, async () => {})
*/
export const makeSynchronized: MakeSynchronized
export const makeDefaultExportSynchronized: MakeDefaultExportSynchronized
export const makeModuleSynchronized: MakeModuleSynchronized
export const makeSynchronizedFunction: MakeSynchronizedFunction
export const makeSynchronizedFunctions: MakeSynchronizedFunctions
export default makeSynchronized
