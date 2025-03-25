import process from 'node:process'
import {RESPONSE_TYPE_REJECT, RESPONSE_TYPE_TERMINATE} from './constants.js'

function packRejectedValue(value) {
  if (value instanceof Error) {
    return {error: value, errorData: {...value}}
  }

  return {error: value}
}

function unpackRejectedValue(error, errorData) {
  if (error instanceof Error && errorData) {
    return Object.assign(error, errorData)
  }

  return error
}

function pack(stdio, data, type) {
  const message = {}

  if (stdio.length !== 0) {
    message.stdio = stdio
  }

  const {exitCode} = process
  if (typeof exitCode === 'number' && exitCode !== 0) {
    message.exitCode = exitCode
  }

  if (type === RESPONSE_TYPE_TERMINATE) {
    message.terminated = true
  }

  if (type === RESPONSE_TYPE_REJECT) {
    message.rejected = true
    return Object.assign(message, packRejectedValue(data))
  }

  if (data !== undefined) {
    message.result = data
  }

  return message
}

function unpack(message) {
  message.stdio ??= []
  message.exitCode ??= 0

  if (message.rejected) {
    message.error = unpackRejectedValue(message.error, message.errorData)
  }

  return message
}

export {pack, unpack}
