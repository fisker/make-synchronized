import {parentPort, workerData} from 'node:worker_threads'
import {initializeModule} from './load-module.js'
import {unlock} from './lock.js'
import Responser from './responser.js'

function startHost() {
  let responser
  parentPort.addListener(
    'message',
    ([action, payload, responseSemaphore, channel]) => {
      // Switch to a new channel
      if (channel) {
        responser?.destroy()
        responser = new Responser(channel)
      }

      responser.process({responseSemaphore, action, payload})
    },
  )

  const {workerRunningSemaphore} = workerData
  if (workerRunningSemaphore) {
    unlock(workerRunningSemaphore)
  }

  initializeModule()
}

export default startHost
