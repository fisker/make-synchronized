export const identity = async (x) => x
export const exit = async (code = 1) => {
  process.exit(code)
}
export const setExitCode = async (code = 1) => {
  process.exitCode = code
}
