import {MessageChannel, receiveMessageOnPort} from 'node:worker_threads'
import {Bench} from 'tinybench'

const {port1, port2} = new MessageChannel()
port1.unref()
port2.unref()

const bench = new Bench({
  name: 'postMessage getData() struct',
})

const getData = () => [1, 2, 3]
const send = (message) => {
  port1.postMessage(message)
  receiveMessageOnPort(port2)
}

bench.add('{result: DATA}', () => send({result: getData()}))
bench.add('{r: DATA}', () => send({r: getData()}))
bench.add('{"": DATA}', () => send({'': getData()}))
bench.add('{result: DATA,...undefined}', () =>
  send({result: getData(), a: undefined, b: undefined}),
)
bench.add('{__proto__: null, result: DATA}', () =>
  send({__proto__: null, result: getData()}),
)
bench.add('Object.create(null), {result: getData())', () =>
  send(Object.assign(Object.create(null), {result: getData()})),
)
bench.add('[DATA]', () => send([getData()]))
bench.add('[DATA, {}]', () => send([getData(), {}]))
// eslint-disable-next-line no-sparse-arrays
bench.add('[,DATA]', () => send([, getData()]))
bench.add('[DATA, undefined]', () => send([getData(), undefined]))
bench.add('[DATA, null]', () => send([getData(), null]))
// eslint-disable-next-line no-sparse-arrays
bench.add('[DATA, <hole>]', () => send([getData(), ,]))
bench.add('Set(DATA)', () => send(new Set([getData()])))
bench.add('Map(DATA)', () => send(new Map([['result', getData()]])))

await bench.run()
port1.close()
console.table(bench.table())
