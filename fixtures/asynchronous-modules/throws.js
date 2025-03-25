const data = new Map([
  ['false', false],
  ['true', true],
  ['0', 0],
  ['1', 1],
  ['0n', 0n],
  ['1n', 1n],
  ['', ''],
  ['string', 'string'],
  ['undefined', undefined],
  ['null', null],
  ['symbol', Symbol('symbol')],
])

export default (value) => Promise.reject(data.get(value))
export {data}
