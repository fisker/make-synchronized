import * as assert from 'node:assert/strict'
import test from 'node:test'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronized} = await loadModuleForTests()
const makeModule = (value) =>
  `export default () => Promise.resolve(${JSON.stringify(value)})`
const makeDataUrl = (value) => `data:text/javascript,;${makeModule(value)}`

test('data url', () => {
  assert.equal(makeSynchronized(makeDataUrl(1))(), 1)
  assert.equal(makeSynchronized(new URL(makeDataUrl(2)))(), 2)
})

// Node.js not supported yet
// const makeBlobUrl = (value) =>
//   URL.createObjectURL(new Blob([makeModule(value)]))
// test('blob', () => {
//   assert.equal(makeSynchronized(makeBlobUrl(1))(), 1)
//   assert.equal(makeSynchronized(new URL(makeBlobUrl(2)))(), 2)
// })
