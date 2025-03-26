import {VALUE_INFORMATION__FUNCTION} from './constants.js'
import Synchronizer from './synchronizer.js'

function makeInlineFunctionSynchronized(implementation) {
  let code =
    typeof implementation === 'function'
      ? implementation.toString()
      : implementation
  code = `export default ${code}`

  const module = `data:text/javascript,;${encodeURIComponent(code)}`
  const synchronizer = Synchronizer.create({module})

  synchronizer.setKnownInformation(undefined, VALUE_INFORMATION__FUNCTION)

  return synchronizer.get('default')
}

export {makeInlineFunctionSynchronized}
