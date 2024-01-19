import {
  Worker,
  receiveMessageOnPort,
  MessageChannel,
} from "worker_threads";

function makeSynchronized(moduleId) {
  let worker;

  return (...args) => {
    worker ??= (() => {
      worker = new Worker(new URL('./worker.js', import.meta.url));
      worker.unref();
    })()

    const signal = new Int32Array(new SharedArrayBuffer(4));
    const { port1: localPort, port2: workerPort } = new MessageChannel();
    const worker = createWorker();

    worker.postMessage(
      { 
        signal,
        port: workerPort,
        moduleId,
        args,
      },
      [workerPort],
    );

    Atomics.wait(signal, 0, 0);

    const {
      message: { result, error, errorData },
    } = receiveMessageOnPort(localPort);

    if (error) {
      throw Object.assign(error, errorData);
    }

    return result;
  }
}

export default makeSynchronized;