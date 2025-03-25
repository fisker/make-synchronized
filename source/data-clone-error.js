function isDataCloneError(error) {
  return error instanceof DOMException && error.name === 'DataCloneError'
}

export {isDataCloneError}
