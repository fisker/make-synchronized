import { parentPort } from "node:worker_threads"
import {CALL} from './constants.js'

async function callFunction({
  url,
  specifier = 'default',
  argumentsList,
}) {
  const {
    [specifier]: function_
  } = await import(url);

  return await Reflect.apply(function_, this, argumentsList);
}

function processAction(action, payload) {
  switch (action) {
    case CALL:
      return callFunction(payload);
    default:
      throw new Error(`Unknown action '${action}'.`)
  }
}

async function listener({
  signal,
  action,
  port,
  payload,
}) {
  const response = {};

  try {
    response.result = await processAction(action, payload);
  } catch (error) {
    response.error = error;
    response.errorData = { ...error };
  }

  try {
    port.postMessage(response);
  } catch {
    port.postMessage({
      error: new Error("Cannot serialize worker response."),
    });
  } finally {
    port.close();
    Atomics.store(signal, 0, 1);
    Atomics.notify(signal, 0);
  }
}

parentPort.addListener("message", listener);