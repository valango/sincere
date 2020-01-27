# Sincere [![Build Status](https://travis-ci.org/valango/sincere.svg?branch=master)](https://travis-ci.org/valango/sincere) [![Code coverage](https://codecov.io/gh/valango/sincere/branch/master/graph/badge.svg)](https://codecov.io/gh/valango/sincere)

Sincere is a lightweight ES6 base class providing intuitive interface for debugging and diagnostics
of Node.js applications.

**NB:** v2.0 has breaking changes:
   1. former static methods _`sincereHook()`_ and _`sincereReset()`_ are renamed to
   _`hook()`_ and _`reset()`_ respectively;
   1. both static methods behavior has slightly changed - see description below.

With Node.js earlier than v8.6.0, something like [`babel`](https://babeljs.io/) is needed.

## Usage
Install with npm

```
npm i sincere
```

## Example
```javascript
const Sincere = require('sincere')

class MyClass extends Sincere {
    ...
}

...

//  Before the execution starts...
Sincere.hook(() => {
  return 0     //  Set debugger breakpoint here.
}

const myInstance = new MyClass(...)

let goodValue = myInstance.assert({good: true}, 'try')
let badValue = myInstance.assert(0, 'try', 'this failed, but %O - you see', goodValue)

```

So, where's the beef? The above code results in `AssertionError` being thrown and the error
message is something like `'MyClass#1.try: this failed, but {good: true} - you see'`.

The instance identifier shows exactly which instance of which class failed the assertion. Also,
if your debugger breakpoint was set, you'd see the whole picture as it was just before throw.
How cool is that?

## API
In 99% likelihood, **_`assert()`_**, **_`hook()`_** and **_`className`_** is all the API you need.

Both _`assert()`_ and _`sincereMessage()`_ use Node.js native `util.format()`;
see Node.js 
[documentation](https://nodejs.org/dist/latest-v12.x/docs/api/util.html#util_util_format_format_args) 
for details.

### Static methods

**`hook(callback=)`** <br />
Sets a _before-the-assertion-will-throw_ callback.
_Falsy_ value inhibits previously set callback; _`undefined`_ argument value
has no effect. _Truthy_ non-function type argument will result in _`TypeError`_ thrown.<br />
**Returns** callback function or _`false`_. <br />
_**NB:**_ In production environment, this method does nothing.

**`reset()`** <br />
Resets internal seed variable for `sincereId` property. <br />
_**NB:**_ available only if **NODE_ENV** was set to `'test'` before loading the module;
calling it in non-test environment will throw exception.

### Instance properties
The instance properties are read-only and can not be over-ridden in derived classes.

**`className`** : string - actual class name, like `'MyClass'`.

**`sincereId`** : string - unique id, something like `'MyClass#42'`.

### Instance methods

**`assert(value, locus, …args)`** <br />
A wrapper method around the native `assert.ok()`. Returns the `value`, if it is truthy - e.g. assertion does not fire.
If assertion fails, then `args` are processed by native `util.format` and `util.inspect` functions,
so the first arg may be format string.

**`sincereMessage(locus, args)`** <br />
Compose a diagnostic message string prefixed with _`sincereId`_
  * `locus : string    ` usually a method name;
  * `args : Array<*>`  arguments to be passed to Node.js
[`util.format()`](https://nodejs.org/dist/latest-v12.x/docs/api/util.html#util_util_format_format_args).
