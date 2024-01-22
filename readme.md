# make-synchronized

[![Build Status][github_actions_badge]][github_actions_link]
[![Coverage][coveralls_badge]][coveralls_link]
[![Npm Version][package_version_badge]][package_link]
[![MIT License][license_badge]][license_link]

[github_actions_badge]: https://img.shields.io/github/actions/workflow/status/fisker/make-synchronized/continuous-integration.yml?branch=main&style=flat-square
[github_actions_link]: https://github.com/fisker/make-synchronized/actions?query=branch%3Amain
[coveralls_badge]: https://img.shields.io/coveralls/github/fisker/make-synchronized/main?style=flat-square
[coveralls_link]: https://coveralls.io/github/fisker/make-synchronized?branch=main
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

This module mainly to support two kinds of different purpose of usage:

1. Make a module that turns asynchronous function into synchronized

   ```js
   import makeSynchronized from 'make-synchronized'

   export default makeSynchronized(import.meta, myAsynchronousFunction)
   ```

1. Make asynchronous functions in an existing module into synchronized

   ```js
   import makeSynchronized from 'make-synchronized'

   const synchronized = makeSynchronized(
     new URL('./my-asynchronous-function-module.js', import.meta.url),
   )
   ```

## Named exports

```js
import {
  makeSynchronized, // Same as the default export
  makeDefaultExportSynchronized,
  makeModuleSynchronized,
  makeSynchronizedFunction,
  makeSynchronizedFunctions,
} from 'make-synchronized'
```

## Limitation

This module uses [`MessagePort#postMessage`](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-transferlist) to transfer arguments, return values, errors between the main thread and the [worker](https://nodejs.org/api/worker_threads.html#class-worker). Please make sure the arguments and return values are serializable by [the structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

## API

### `makeSynchronized(module, implementation)`

> Make asynchronous functions to be synchronized for export.

- If `implementation` is a `function`, returns a synchronized version of the passed function.

  **Note: It MUST be used as the default export**

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

  **Note: Functions MUST exported as the same name as the key in `implementation` object.**

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

### `makeSynchronized(module)`

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

### `makeSynchronizedFunction(module, implementation, specifier?)`

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

### `makeSynchronizedFunctions(module, implementation)`

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

### `makeDefaultExportSynchronized(module)`

> Make an existing module's default export to be a synchronized function.

Explicit version of `makeSynchronized(module)` that only returns the synchronized default export.

```js
import {makeDefaultExportSynchronized} from 'make-synchronized'

const foo = makeModuleSynchronized('foo')

foo()
// -> default export of `foo` module is called.
```

### `makeModuleSynchronized(module)`

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
