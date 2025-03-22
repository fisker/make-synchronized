export const console = {...globalThis.console}
export const logs = async (messages) => {
  for (const {type, message} of messages) {
    console[type](message)
  }
}
export const writes = async (messages) => {
  for (const {type, message} of messages) {
    process[type].write(message)
  }
}
export const printObject = async () => {
  console.log(printObject)
}
