import process from 'node:process'
import {RESPONSE_TYPE_ERROR, RESPONSE_TYPE_TERMINATE} from './constants.js'

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

  if (type === RESPONSE_TYPE_ERROR) {
    message.rejected = true
    message.error = data
    message.errorData = {...data}
    return message
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
    Object.assign(message.error, message.errorData)
  }

  return message
}

export {pack, unpack}
