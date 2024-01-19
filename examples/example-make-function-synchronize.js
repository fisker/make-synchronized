import * as url from 'node:url'
import makeSynchronized from "../index.js";

const synchronized = makeSynchronized(() => Promise.resolve('resolved'));

console.log(synchronized())