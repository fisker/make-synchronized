export type WorkerResponseData = {
  stdio: {stream: 'stdout' | 'stderr'; chunk: string}[]
} & (
  | {terminated: true}
  | {error: Error; errorData: Record<string, any>}
  | {result: any}
)

export type Module = string | URL | {url: string}

export type ModuleId = string

export type NormalizedPropertyPath = string[]
export type PropertyPath = undefined | string | NormalizedPropertyPath

export type Worker = typeof import('node:worker_threads').Worker
