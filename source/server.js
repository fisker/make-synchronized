import {parentPort} from 'node:worker_threads'
import {initializeModule} from './load-module.js'
import Responser from './responser.js'

function startServer() {
  let responser
  parentPort.on('message', ([action, payload, channel]) => {
    // Switch to a new channel
    if (channel) {
      responser?.destroy()
      responser = new Responser(channel)
    }

    responser.process({action, payload})
  })

  try {
    initializeModule()
    /* c8 ignore start */
  } catch {
    // No op
  }
  /* c8 ignore end */
}

export default startServer
