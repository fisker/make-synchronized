import {
  MODULE_TYPE__INLINE_FUNCTION,
  VALUE_INFORMATION__FUNCTION,
} from './constants.js'
import Synchronizer from './synchronizer.js'

function makeInlineFunctionSynchronized(implementation) {
  const code =
    typeof implementation === 'function'
      ? implementation.toString()
      : implementation

  const synchronizer = Synchronizer.create(
    {type: MODULE_TYPE__INLINE_FUNCTION, code},
    {isNormalizedModule: true},
  )

  synchronizer.setKnownInformation(undefined, VALUE_INFORMATION__FUNCTION)

  return synchronizer.get('default')
}

export {makeInlineFunctionSynchronized}
