type Module = string | URL | {url: string}
type NormalizedPropertyPath = string[]
type PropertyPath = undefined | string | NormalizedPropertyPath

type AnyFunction = (...argumentsList: any[]) => unknown
type AsynchronousFunction = (...argumentsList: any[]) => Promise<unknown>
type ObjectWithFunctions = Record<string, unknown>
type ModuleExportImplementation = ObjectWithFunctions | AnyFunction
type SynchronizedFunction<
  InputAsynchronousFunction extends AnyFunction = AnyFunction,
> = (
  ...argumentsList: Parameters<InputAsynchronousFunction>
) => Awaited<ReturnType<InputAsynchronousFunction>>
type SynchronizedObject<
  InputObject extends ObjectWithFunctions = ObjectWithFunctions,
> = {
  [Key in keyof InputObject]: InputObject[Key] extends AsynchronousFunction
    ? SynchronizedFunction<InputObject[Key]>
    : InputObject[Key]
}
type SynchronizedModule<InputNodeModule = Record<string, unknown>> = {
  [Key in keyof InputNodeModule]: InputNodeModule[Key] extends AsynchronousFunction
    ? SynchronizedFunction<InputNodeModule[Key]>
    : Awaited<InputNodeModule[Key]>
}
type NodeModule = Record<string, unknown>
type NodeModuleWithFunctionDefaultExport = NodeModule & {
  default: AnyFunction
}

type SynchronizedDefaultExportProxy<
  InputNodeModule extends
    NodeModuleWithFunctionDefaultExport = NodeModuleWithFunctionDefaultExport,
> = SynchronizedFunction<InputNodeModule['default']> &
  SynchronizedModule<InputNodeModule>

export type MakeDefaultExportSynchronized<
  InputNodeModule extends
    NodeModuleWithFunctionDefaultExport = NodeModuleWithFunctionDefaultExport,
> = (module: Module) => SynchronizedFunction<InputNodeModule['default']>

export type MakeModuleSynchronized<
  InputNodeModule extends NodeModule = NodeModule,
> = (module: Module) => SynchronizedModule<InputNodeModule>

export type MakeSynchronizedFunction<
  InputObjectWithFunctions extends AsynchronousFunction = AsynchronousFunction,
> = (
  module: Module,
  implementation: InputObjectWithFunctions,
  specifier?: PropertyPath,
) => SynchronizedFunction<InputObjectWithFunctions>

export type MakeSynchronizedFunctions<
  InputObjectWithFunctions extends ObjectWithFunctions = ObjectWithFunctions,
> = (
  module: Module,
  implementation: InputObjectWithFunctions,
  specifier?: PropertyPath,
) => SynchronizedObject<InputObjectWithFunctions>

/**
Make a module synchronized.

@param {string | URL | ImportMeta} module - module to be synchronized

@example
```js
import makeSynchronized from 'make-synchronized'

const synchronizedFoo = makeSynchronized<typeof import('foo')>('foo')
```
*/
export function makeSynchronized<InputNodeModule = Record<string, unknown>>(
  module: Module,
): InputNodeModule extends NodeModuleWithFunctionDefaultExport
  ? SynchronizedDefaultExportProxy<InputNodeModule>
  : SynchronizedModule<InputNodeModule>

/**
Make a function synchronized to export.

@param {string | URL | ImportMeta} module - current module
@param {function | Record<string, function | unknown>} implementation - current module implementation

@example
```js
import makeSynchronized from 'make-synchronized'

export default makeSynchronized(import.meta, async () => {})
```
*/
export function makeSynchronized<
  InputImplementation extends ModuleExportImplementation,
>(
  module: Module,
  implementation: InputImplementation,
): InputImplementation extends AnyFunction
  ? SynchronizedFunction<InputImplementation>
  : InputImplementation extends ObjectWithFunctions
    ? SynchronizedObject<InputImplementation>
    : never

export const makeDefaultExportSynchronized: MakeDefaultExportSynchronized
export const makeModuleSynchronized: MakeModuleSynchronized
export const makeSynchronizedFunction: MakeSynchronizedFunction
export const makeSynchronizedFunctions: MakeSynchronizedFunctions
export default makeSynchronized
