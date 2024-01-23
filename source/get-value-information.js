import {
  VALUE_TYPE_FUNCTION,
  VALUE_TYPE_PRIMITIVE,
  VALUE_TYPE_PLAIN_OBJECT,
  VALUE_TYPE_UNKNOWN,
} from './constants.js'

function getPlainObjectPropertyInformation(object, key) {
  const descriptor = Object.getOwnPropertyDescriptor(object, key)

  if (Object.hasOwn(descriptor, 'value')) {
    return
  }

  const {value} = descriptor

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
}

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

  const information = {type: VALUE_TYPE_UNKNOWN}
  if (Object.getPrototypeOf(value) === null) {
    information.type = VALUE_TYPE_PLAIN_OBJECT
    information.isNullPrototypeObject = true
  }

  if (value.constructor === Object) {
    information.type = VALUE_TYPE_PLAIN_OBJECT
  }

  if (information.type === VALUE_TYPE_PLAIN_OBJECT) {
    information.properties = new Map(
      Object.keys(value).map((property) => [
        property,
        getPlainObjectPropertyInformation(value, property),
      ]),
    )
  }

  return {type: VALUE_TYPE_UNKNOWN}
}

export default getValueInformation
