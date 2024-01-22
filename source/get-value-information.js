import {
  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_PRIMITIVE,
  VALUE_TYPE_ARRAY,
  VALUE_TYPE_UNKNOWN,
} from './constants.js'

function getValueInformation(value) {
  if (typeof value === 'function') {
    return {type: VALUE_TYPE_FUNCTION}
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#primitive_values
  const type = typeof value
  if (
    value === null ||
    type === 'undefined' ||
    type === 'boolean' ||
    type === 'number' ||
    type === 'bigint' ||
    type === 'string'
  ) {
    return {type: VALUE_TYPE_PRIMITIVE, value}
  }

  if (Array.isArray(value)) {
    return {type: VALUE_TYPE_ARRAY, length: value.length}
  }

  return {type: VALUE_TYPE_UNKNOWN}
}

export default getValueInformation
