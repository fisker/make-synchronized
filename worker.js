import { parentPort } from "node:worker_threads"
import { CALL, GET, GET_MODULE_SPECIFIERS } from './constants.js'

async function callFunction({
  url,
  specifier = 'default',
  argumentsList,
}) {
  const module = await import(url);

  return await Reflect.apply(module[specifier], this, argumentsList);
}

async function getSpecifiers({url}) {
  const module = await import(url);

  return Object.entries(module)
    .map(([specifier, value]) => ({
      specifier,
      type: typeof value
    }))
}

async function getProperty({url, property}) {
  const module = await import(url);

  return module[property];
}

function processAction(action, payload) {
  switch (action) {
    case CALL:
      return callFunction(payload);
    case GET:
      return getProperty(payload);
    case GET_MODULE_SPECIFIERS:
      return getSpecifiers(payload);
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