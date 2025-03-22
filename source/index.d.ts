type Module = string | URL | {url: string}
type NormalizedPropertyPath = string[]
type PropertyPath = undefined | string | NormalizedPropertyPath

type AnyFunction = (...argumentsList: any[]) => any
type AsynchronousFunction = (...argumentsList: any[]) => Promise<any>
type ObjectWithFunctions = Record<string, any>
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
type SynchronizedModule<InputNodeModule = Record<string, any>> = {
  [Key in keyof InputNodeModule]: InputNodeModule[Key] extends AsynchronousFunction
    ? SynchronizedFunction<InputNodeModule[Key]>
    : Awaited<InputNodeModule[Key]>
}
type NodeModule = Record<string, any>
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
export function makeSynchronized<InputNodeModule = Record<string, any>>(
  module: Module,
): InputNodeModule extends NodeModuleWithFunctionDefaultExport
  ? SynchronizedDefaultExportProxy<InputNodeModule>
  : SynchronizedModule<InputNodeModule>

/**
Make a function synchronized to export.

@param {string | URL | ImportMeta} module - current module
@param {function | Record<string, any>} implementation - current module implementation

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

/**
Make a asynchronous function synchronized for default export.

@param {string | URL | ImportMeta} module - current module location
@param {AsynchronousFunction} implementation - asynchronous function implementation

@example
```js
import {makeSynchronizedFunction} from 'make-synchronized'

export default makeSynchronizedFunction(import.meta, myAsynchronousFunction)
```
*/
export function makeSynchronizedFunction<
  InputFunction extends AsynchronousFunction = AsynchronousFunction,
>(
  module: Module,
  implementation: InputFunction,
): SynchronizedFunction<InputFunction>

/**
Make a asynchronous function synchronized for named export.

@param {string | URL | ImportMeta} module - current module location
@param {AsynchronousFunction} implementation - asynchronous function implementation
@param {string | string[]} specifier - function access path, MUST match the export specifier

@example
```js
import {MakeSynchronizedFunction} from 'make-synchronized'

export const mySynchronousFunction = makeSynchronizedFunction(import.meta, myAsynchronousFunction, 'mySynchronousFunction')
```
*/
export function makeSynchronizedFunction<
  InputFunction extends AsynchronousFunction = AsynchronousFunction,
>(
  module: Module,
  implementation: InputFunction,
  specifier?: PropertyPath,
): SynchronizedFunction<InputFunction>

export const makeDefaultExportSynchronized: MakeDefaultExportSynchronized
export const makeModuleSynchronized: MakeModuleSynchronized
export const makeSynchronizedFunctions: MakeSynchronizedFunctions
export default makeSynchronized
