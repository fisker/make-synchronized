import test from 'node:test'
import * as assert from 'node:assert/strict'
import process from 'node:process'
import stripAnsi from 'strip-ansi'
import loadModuleForTests from '../scripts/load-module-for-tests.js'

const {makeSynchronized} = await loadModuleForTests()

const stdio = makeSynchronized(
  new URL('../fixtures/asynchronous-modules/stdio.js', import.meta.url),
)

const getResult = (run) => {
  const original = {}
  const result = []

  for (const type of ['stdout', 'stderr']) {
    original[type] = process[type].write

    process[type].write = (message) => {
      message = stripAnsi(message)
      result.push({type, message})
    }
  }

  try {
    run()
  } finally {
    for (const type of ['stdout', 'stderr']) {
      process[type].write = original[type]
    }
  }

  return result
}

test('stdio', () => {
  {
    const result = getResult(() => {
      stdio.console.log('console.log called')
    })
    assert.deepEqual(result, [
      {type: 'stdout', message: 'console.log called\n'},
    ])
  }

  {
    const result = getResult(() => {
      stdio.console.warn('console.warn called')
    })
    assert.deepEqual(result, [
      {type: 'stderr', message: 'console.warn called\n'},
    ])
  }

  {
    const result = getResult(() => {
      stdio.console.error('console.error called')
    })
    assert.deepEqual(result, [
      {type: 'stderr', message: 'console.error called\n'},
    ])
  }

  {
    const [{message}] = getResult(() => {
      stdio.console.table([{fisker: 'jerk'}])
    })
    const possibleOutputs = [
      /* Indent */ `
        ┌─────────┬────────┐
        │ (index) │ fisker │
        ├─────────┼────────┤
        │ 0       │ 'jerk' │
        └─────────┴────────┘
      `,
      /* Indent */ `
        ┌─────────┬────────┐
        │ (index) │ fisker │
        ├─────────┼────────┤
        │    0    │ 'jerk' │
        └─────────┴────────┘
      `,
    ].map(
      (table) =>
        `${table
          .trim()
          .split('\n')
          .map((line) => line.trim())
          .join('\n')}\n`,
    )
    assert.ok(
      possibleOutputs.includes(message),
      `expected one of: ${possibleOutputs.join('\n\n')}`,
    )
  }

  {
    const result = getResult(() => {
      stdio.logs([
        {type: 'log', message: '1'},
        {type: 'error', message: '2'},
        {type: 'log', message: '3'},
        {type: 'warn', message: '4'},
      ])
    })
    assert.deepEqual(result, [
      {type: 'stdout', message: '1\n'},
      {type: 'stderr', message: '2\n'},
      {type: 'stdout', message: '3\n'},
      {type: 'stderr', message: '4\n'},
    ])
  }

  {
    const [{message}] = getResult(() => {
      stdio.logs([{type: 'time'}, {type: 'timeEnd'}])
    })

    assert.ok(/default: [\d.]+ms\n/.test(message), message)
  }

  {
    const messages = [
      {type: 'stdout', message: '1'},
      {type: 'stderr', message: '2'},
      {type: 'stdout', message: '3'},
      {type: 'stderr', message: '4'},
    ]

    const result = getResult(() => {
      stdio.writes(messages)
    })
    assert.deepEqual(result, messages)
  }

  {
    const result = getResult(() => {
      stdio.printObject()
    })

    assert.deepEqual(result, [
      {type: 'stdout', message: '[AsyncFunction: printObject]\n'},
    ])
  }
})
