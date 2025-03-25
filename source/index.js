import module from 'node:module'
import {isMainThread} from 'node:worker_threads'
import startHost from './host.js'
import {setWorkFile} from './threads-worker.js'

module.enableCompileCache?.()

if (isMainThread) {
  setWorkFile(new URL(import.meta.url))
} else {
  startHost()
}

export {makeSynchronized as default} from './client.js'
export * from './client.js'
