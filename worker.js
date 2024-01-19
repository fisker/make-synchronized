import { parentPort } from "worker_threads";

parentPort.addListener(
  "message",
  async ({
    signal,
    port,
    module,
    entryPoint = 'default',
    argumentsList,
   }) => {
    const response = {};

    try {
      const {
        [entryPoint]: function_
      } = await import(module);
      response.result = await function_(...argumentsList);
    } catch (error) {
      response.error = error;
      response.errorData = { ...error };
    }

    try {
      port.postMessage(response);
    } catch {
      port.postMessage({
        error: new Error("Cannot serialize worker response"),
      });
    } finally {
      port.close();
      Atomics.store(signal, 0, 1);
      Atomics.notify(signal, 0);
    }
  },
);