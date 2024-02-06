class AtomicsWaitError extends Error {
  code = ''

  name = 'AtomicsWaitError'

  constructor(code) {
    super(code === 'timed-out' ? 'Timed out' : 'Unexpected error')
    this.code = code
  }
}

export default AtomicsWaitError
