import makeSynchronized from '../source/index.js'

const synchronized = makeSynchronized(() => Promise.resolve('resolved'))

console.log(synchronized())
