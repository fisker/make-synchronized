import process from 'node:process'
import {RESPONSE_TYPE__REJECT, RESPONSE_TYPE__TERMINATE} from './constants.js'

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

function packResponseMessage(stdio, data, type) {
  let extraData
  if (stdio.length !== 0) {
    extraData ??= {}
    extraData.stdio = stdio
  }

  const {exitCode} = process
  if (typeof exitCode === 'number' && exitCode !== 0) {
    extraData ??= {}
    extraData.exitCode = exitCode
  }

  if (type === RESPONSE_TYPE__TERMINATE) {
    extraData ??= {}
    extraData.terminated = true
  }

  if (type === RESPONSE_TYPE__REJECT) {
    extraData ??= {}
    extraData.rejected = true
    return [undefined, Object.assign(extraData, packRejectedValue(data))]
  }

  // This is the most common format
  const message = [data]

  if (extraData !== undefined) {
    message.push(extraData)
  }

  return message
}

function unpackResponseMessage(message) {
  if (message.length === 1) {
    return {result: message[0]}
  }

  const [result, extraData] = message
  if (extraData.rejected) {
    extraData.error = unpackRejectedValue(extraData.error, extraData.errorData)
  }

  return {result, ...extraData}
}

export {packResponseMessage, unpackResponseMessage}
