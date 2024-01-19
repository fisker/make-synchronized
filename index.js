import {
  Worker,
  receiveMessageOnPort,
  MessageChannel,
} from "worker_threads"

function useModule({module, entryPoint}) {
  let worker

  return function (...argumentsList) {
    worker ??= (() => {
      worker = new Worker(new URL('./worker.js', import.meta.url))
      worker.unref()
      return worker
    })()

    const signal = new Int32Array(new SharedArrayBuffer(4))
    const { port1: localPort, port2: workerPort } = new MessageChannel()

    worker.postMessage(
      { 
        signal,
        port: workerPort,
        module,
        entryPoint,
        argumentsList,
      },
      [workerPort],
    )

    Atomics.wait(signal, 0, 0)

    const {
      message: { result, error, errorData },
    } = receiveMessageOnPort(localPort)

    if (error) {
      throw Object.assign(error, errorData)
    }

    return result
  }
}

function makeSynchronized(module) {
  if (module instanceof URL) {
    module = module.href;
  } else if (typeof module === 'function') {
    module = `data:application/javascript;,export default ${encodeURIComponent(String(module))}`;
  }

  const defaultExport = useModule({module})

  return new Proxy(defaultExport, {
    apply: (target, thisArg, argumentsList) => Reflect.apply(target, thisArg, argumentsList),
    get: (target, property, receiver) => useModule({module, entryPoint: property}),
  })
}

export default makeSynchronized;