import makeSynchronized from 'make-synchronized'

export default makeSynchronized(
  import.meta,
  async () => 'default export called',
)
