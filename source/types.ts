export type WorkerResponseData = {
  stdio: {stream: 'stdout' | 'stderr'; chunk: string}[]
} & (
  | {terminated: true}
  | {error: Error; errorData: Record<string, any>}
  | {result: any}
)

export type Module = string | URL | ImportMeta

export type ModuleId = string

export type NormalizedPropertyPath = string[]
export type PropertyPath = undefined | string | NormalizedPropertyPath

export type Worker = typeof import('node:worker_threads').Worker

export type AsynchronousFunction = (...any) => any
export type AsynchronousFunctions = Record<string, AsynchronousFunction>
export type ModuleExportImplementation =
  | AsynchronousFunctions
  | AsynchronousFunction
export type SynchronizedFunction<
  InputAsynchronousFunction extends AsynchronousFunction = AsynchronousFunction,
> = (
  ...argumentsList: Parameters<InputAsynchronousFunction>[]
) => Awaited<ReturnType<InputAsynchronousFunction>>
export type SynchronizedFunctions<
  InputAsynchronousFunctions extends
    AsynchronousFunctions = AsynchronousFunctions,
> = {
  [Key in keyof InputAsynchronousFunctions]: SynchronizedFunction<
    InputAsynchronousFunctions[Key]
  >
}
export type SynchronizedModule<InputNodeModule = Record<string, any>> = {
  [Key in keyof InputNodeModule]: InputNodeModule[Key] extends AsynchronousFunction
    ? SynchronizedFunction<InputNodeModule[Key]>
    : InputNodeModule[Key]
}
export type NodeModuleWithAsynchronousFunctionDefaultExport = Record<
  string,
  unknown
> & {default: AsynchronousFunction}

export type SynchronizedDefaultExportProxy<
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

  <InputNodeModule = Record<string, any>>(
    module,
  ): InputNodeModule extends NodeModuleWithAsynchronousFunctionDefaultExport
    ? SynchronizedDefaultExportProxy<InputNodeModule>
    : SynchronizedModule<InputNodeModule>
}
