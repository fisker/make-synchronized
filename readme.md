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

```js
import makeSynchronized from 'make-synchronized'

const synchronized = makeSynchronized(
  new URL('./my-asynchronous-function-module.js', import.meta.url),
)

// Now you can call any async function in `my-asynchronous-function-module.js`
// and it will return the value synchronously
synchronized()
```

## Limitation

This module uses [`MessagePort#postMessage`](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-transferlist) to transfer arguments, return values, and errors between the main thread and the [worker](https://nodejs.org/api/worker_threads.html#class-worker). Please make sure the arguments and return values are serializable by [the structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

## API

### `makeSynchronized(module: string | URL | ImportMeta)`

> Make asynchronous functions in module to be synchronized to call.

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

---

This module can be considered as a drop-in replacement of dynamic `import()`

```diff
- const {default: foo} = await import('foo')
+ const {default: foo} = makeModuleSynchronized('foo')
```
