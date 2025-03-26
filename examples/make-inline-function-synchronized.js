import makeSynchronized from 'make-synchronized'

const synchronized = makeSynchronized(() => Promise.resolve('Hello world!'))

console.log(synchronized())
