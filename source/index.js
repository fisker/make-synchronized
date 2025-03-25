import module from 'node:module'
import {IS_SERVER} from './constants.js'
import startServer from './server.js'
import {setWorkFile} from './threads-worker.js'

module.enableCompileCache?.()

setWorkFile(new URL(import.meta.url))

if (IS_SERVER) {
  startServer()
}

export {makeSynchronized as default} from './client.js'
export * from './client.js'
