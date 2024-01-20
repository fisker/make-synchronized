import {
  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_ARRAY,
  VALUE_TYPE_OBJECT,
  VALUE_TYPE_KNOWN,
  VALUE_TYPE_UNKNOWN,
} from './constants.js'

function getValueInformation(value) {
  if (typeof value === 'function') {
    return {type: VALUE_TYPE_FUNCTION}
  }

  if (Array.isArray(value)) {
    return {type: VALUE_TYPE_ARRAY}
  }

  if (typeof value === 'object' && value !== null) {
    return {type: VALUE_TYPE_OBJECT}
  }

  const type = typeof value
  if (
    value === null ||
    type === 'undefined' ||
    type === 'number' ||
    type === 'string' ||
    type === 'boolean'
  ) {
    return {type: VALUE_TYPE_KNOWN, value}
  }

  return {type: VALUE_TYPE_UNKNOWN}
}

export default getValueInformation
