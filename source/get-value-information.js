import {
  VALUE_INFORMATION__FUNCTION,
  VALUE_TYPE__PLAIN_OBJECT,
  VALUE_TYPE__PRIMITIVE,
  VALUE_TYPE__UNKNOWN,
} from './constants.js'

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#primitive_values
const PRIMITIVE_VALUE_TYPES = new Set([
  'undefined',
  'boolean',
  'number',
  'bigint',
  'string',
])
const isPrimitive = (value) =>
  value === null || PRIMITIVE_VALUE_TYPES.has(typeof value)

function getPlainObjectPropertyInformation(object, key) {
  const descriptor = Object.getOwnPropertyDescriptor(object, key)

  if (!Object.hasOwn(descriptor, 'value')) {
    return
  }

  const {value} = descriptor

  if (isPrimitive(value)) {
    return {type: VALUE_TYPE__PRIMITIVE, value}
  }
}

function getValueInformation(value) {
  if (typeof value === 'function') {
    return VALUE_INFORMATION__FUNCTION
  }

  if (isPrimitive(value)) {
    return {type: VALUE_TYPE__PRIMITIVE, value}
  }

  const information = {type: VALUE_TYPE__UNKNOWN}
  if (Object.getPrototypeOf(value) === null) {
    information.type = VALUE_TYPE__PLAIN_OBJECT
    information.isNullPrototypeObject = true
  }

  if (value.constructor === Object) {
    information.type = VALUE_TYPE__PLAIN_OBJECT
  }

  if (information.type === VALUE_TYPE__PLAIN_OBJECT) {
    information.properties = new Map(
      Object.keys(value).map((property) => [
        property,
        getPlainObjectPropertyInformation(value, property),
      ]),
    )
  }

  return information
}

export default getValueInformation
