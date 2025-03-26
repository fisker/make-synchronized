import module from 'node:module'
import {IS_SERVER} from './constants.js'
import startServer from './server.js'
import {setWorkFile} from './threads-worker.js'

module.enableCompileCache?.()

if (IS_SERVER) {
  try {
    startServer()
  } catch {
    // No op
  }
} else {
  setWorkFile(new URL(import.meta.url))
}

export {makeSynchronized as default} from './client.js'
export * from './client.js'
