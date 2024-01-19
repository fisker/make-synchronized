import {
  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_ARRAY,
  VALUE_TYPE_OBJECT,
} from './constants.js'

function getValueType(value) {
  if (typeof value === 'function') {
    return VALUE_TYPE_FUNCTION
  }

  if (Array.isArray(value)) {
    return VALUE_TYPE_ARRAY
  }

  if (typeof value === 'object' && value !== null) {
    return VALUE_TYPE_OBJECT
  }

  return typeof value
}

export default getValueType
