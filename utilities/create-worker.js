import {Worker} from 'node:worker_threads'
import {WORKER_URL} from './constants.js'

function createWorker(options) {
  const worker = new Worker(WORKER_URL, options)
  worker.unref()
  return worker
}

export default createWorker
