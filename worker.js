import { parentPort } from "worker_threads";

parentPort.addListener(
  "message",
  async ({
    signal,
    port,
    moduleId,
    args,
   }) => {
    const response = {};

    try {
      const {default: function_} = await import('moduleId');
      response.result = await function_(...args);
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