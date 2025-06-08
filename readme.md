# make-synchronized

[![Coverage][codecov_badge]][codecov_link]
[![Npm Version][package_version_badge]][package_link]
[![MIT License][license_badge]][license_link]

[codecov_badge]: https://img.shields.io/codecov/c/github/fisker/make-synchronized?style=flat-square
[codecov_link]: https://codecov.io/gh/fisker/make-synchronized
[license_badge]: https://img.shields.io/npm/l/make-synchronized.svg?style=flat-square
[license_link]: https://github.com/fisker/make-synchronized/blob/main/license
[package_version_badge]: https://img.shields.io/npm/v/make-synchronized.svg?style=flat-square
[package_link]: https://www.npmjs.com/package/make-synchronized

> Make synchronized functions.

## Install

```bash
yarn add make-synchronized
```

## Usage

This module mainly to support three kinds of different purpose of usage:

1. Make asynchronous functions in an existing module into synchronized

   ```js
   import makeSynchronized from 'make-synchronized'

   const synchronized = makeSynchronized(
     new URL('./my-asynchronous-function-module.js', import.meta.url),
   )
   ```

1. Make a module that turns asynchronous function into synchronized

   ```js
   import makeSynchronized from 'make-synchronized'

   export default makeSynchronized(import.meta, myAsynchronousFunction)
   ```

1. Make an inline asynchronous function into synchronized

   ```js
   import makeSynchronized from 'make-synchronized'

   const synchronized = makeSynchronized(() => Promise.resolve('foo'))
   ```

## Named exports

```js
import {
  makeSynchronized, // Same as the default export
  makeDefaultExportSynchronized,
  makeModuleSynchronized,
  makeSynchronizedFunction,
  makeSynchronizedFunctions,
  makeInlineFunctionSynchronized,
} from 'make-synchronized'
```

## Limitation

This module uses [`MessagePort#postMessage`](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-transferlist) to transfer arguments, return values, errors between the main thread and the [worker](https://nodejs.org/api/worker_threads.html#class-worker). Please make sure the arguments and return values are serializable by [the structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

## API

### `makeSynchronized(module: string | URL | ImportMeta)`

> Make asynchronous functions in an existing module to be synchronized to call.

- If the passing `module` is a module that contains a function type default export, returns a `Proxy` function, with other specifiers attached.

  ```js
  // foo.js
  export default () => Promise.resolve('default export called')
  export const foo = 'foo'
  export const bar = () => Promise.resolve('bar called')
  ```

  ```js
  const synchronized = makeSynchronized(new URL('./foo.js', import.meta.url))

  synchronized()
  // -> "default export called"

  synchronized.foo
  // -> "foo"

  // This function also synchronized.
  synchronized.bar()
  // -> "bar called"
  ```

  [Example](./examples/make-default-export-function-synchronized.js)

- If the passing `module` is a module without default export or default export is not a function, a `Module` object will be returned with all specifiers.

  ```js
  // foo.js
  export const foo = 'foo'
  export const bar = () => Promise.resolve('bar called')
  ```

  ```js
  import makeSynchronized from 'make-synchronized'

  const module = makeSynchronized(new URL('./foo.js', import.meta.url))

  module
  // [Object: null prototype] [Module] { bar: [Getter], foo: [Getter] }

  module.foo
  // -> "foo"

  module.bar()
  // -> "bar called"
  ```

  [Example](./examples/make-module-specifiers-synchronized.js)

### `makeSynchronized(module: string | URL | ImportMeta, implementation: function | object)`

> Make asynchronous functions to be synchronized for export.

- If `implementation` is a `function`, returns a synchronized version of the passed function.

  > [!IMPORTANT]
  >
  > **It MUST be used as the default export**

  ```js
  // foo.js
  import makeSynchronized from 'make-synchronized'

  export default makeSynchronized(import.meta, () => Promise.resolve('foo'))
  ```

  ```js
  import foo from './foo.js'

  foo()
  // -> foo
  ```

  - [Example](./examples/use-module-synchronized-as-default.js)

- If `implementation` is a `object` with multiple functions, returns a `Proxy` object with synchronized functions attached.

  > [!IMPORTANT]
  >
  > **Functions MUST exported as the same name as the key in `implementation` object.**

  ```js
  // foo-and-bar.js
  import makeSynchronized from 'make-synchronized'

  export const {foo, bar} = makeSynchronized(import.meta, {
    async foo() {
      return 'foo'
    },
    async bar() {
      return 'bar'
    },
  })
  ```

  ```js
  import {foo, bar} from './foo-and-bar.js'

  foo()
  // -> foo

  bar()
  // -> bar
  ```

- [Example](./examples/use-module-synchronized-as-default.js)

### `makeSynchronized(implementation: function)`

```js
import makeSynchronized from 'make-synchronized'

const foo = makeSynchronized(() => Promise.resolve('foo'))

foo()
// -> foo
```

> [!IMPORTANT]
>
> The given function is executed in a separate environment, so you cannot use any variables/imports from outside the scope of the function. You can pass in arguments to the function. To import dependencies, use `await import(…)` in the function body.

- [Example](./examples/use-inline-function.js)

### `makeSynchronizedFunction(module: string | URL | ImportMeta, implementation: function, specifier?: string)`

> Make a synchronized function for export.

Explicit version of `makeSynchronized(module, implementation)` that returns the synchronized function for export.

```js
import {makeSynchronizedFunction} from 'make-synchronized'

export default makeSynchronizedFunction(
  import.meta,
  async () => 'default export called',
)
export const foo = makeSynchronizedFunction(
  import.meta,
  async () => 'foo export called',
  'foo',
)
```

### `makeSynchronizedFunctions(module: string | URL | ImportMeta, implementation: object)`

> Make synchronized functions for export.

Explicit version of `makeSynchronized(module, implementation)` that only returns `Proxy` with synchronized functions for export.

```js
import {makeSynchronizedFunctions} from 'make-synchronized'

export const {
  // MUST match the key in second argument
  foo,
  bar,
} = makeSynchronizedFunctions(import.meta, {
  foo: async () => 'foo export called',
  bar: async () => 'bar export called',
})
```

### `makeDefaultExportSynchronized(module: string | URL | ImportMeta)`

> Make an existing module's default export to be a synchronized function.

Explicit version of `makeSynchronized(module)` that only returns the synchronized default export.

```js
import {makeDefaultExportSynchronized} from 'make-synchronized'

const foo = makeModuleSynchronized('foo')

foo()
// -> default export of `foo` module is called.
```

### `makeModuleSynchronized(module: string | URL | ImportMeta)`

> Make an existing module's exports to be synchronized functions.

Synchronize version of `import(module)`, always returns a `Module`.

```diff
- const {default: foo} = await import('foo')
+ const {default: foo} = makeModuleSynchronized('foo')
```

```js
import {makeModuleSynchronized} from 'make-synchronized'

const {default: foo, bar} = makeModuleSynchronized('foo')

foo()
// -> default export of `foo` module is called.

bar()
// -> `bar` function from `foo` module is called.
```

### `makeInlineFunctionSynchronized(implementOrCode: function | string)`

> Make an inline asynchronous function into synchronized.

> [!IMPORTANT]
>
> The given function is executed in a separate environment, so you cannot use any variables/imports from outside the scope of the function. You can pass in arguments to the function. To import dependencies, use `await import(…)` in the function body.

Explicit version of `makeSynchronized(function)`.

```js
import makeSynchronized from 'make-synchronized'

const foo = makeSynchronized(() => Promise.resolve('foo'))

foo()
// -> foo
```

```js
import makeSynchronized from 'make-synchronized'

const foo = makeSynchronized(`
  () => ${someOtherCode}
`)

foo()
```

```js
import makeSynchronized from 'make-synchronized'

const sleep = makeSynchronized((delay) =>
  process.getBuiltinModule('node:timers/promises').setTimeout(delay),
)
```

```js
import makeSynchronized from 'make-synchronized'

const sleep = makeSynchronized(async (delay) => {
  const {setTimeout} = await import('node:timers/promises')
  await setTimeout(delay)
})
```
