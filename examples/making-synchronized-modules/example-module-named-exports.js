import makeSynchronized from 'make-synchronized'

export const {foo, bar} = makeSynchronized(import.meta, {
  async foo() {
    return 'foo called'
  },
  bar: async () => 'bar called',
})
