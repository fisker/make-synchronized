const context = new (class {
  get getterIsWorkingAsExpected() {
    return this === context
  }
  methodIsWorkingAsExpected() {
    return this === context
  }
})()

export {context}
