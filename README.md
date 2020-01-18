# Sincere [![Build Status](https://travis-ci.org/valango/sincere.svg?branch=master)](https://travis-ci.org/valango/sincere) [![Code coverage](https://codecov.io/gh/valango/sincere/branch/master/graph/badge.svg)](https://codecov.io/gh/valango/sincere)

Sincere is a lightweight javascript base class providing intuitive interface for debugging and diagnostics
of Node.js applications.

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
Sincere.sincereHook(() => {
  return 0     //  Set debugger breakpoint here.
}

const myInstance = new MyClass(...)

let goodValue = myInstance.assert({good: true}, 'try')
let badValue = myInstance.assert(0, 'try', 'this failed, but %s - you see', goodValue)

```

So, where's the beef? The above code results in `AssertionError` being thrown and the error
message is something like `'MyClass#1.try: this failed, but {good: true} - you see'`.

The instance identifier shows exactly which instance of which class failed the assertion. Also,
if your debugger breakpoint was set, you'd see the whole picture as it was just before throw.
How cool is that?

## API

### Static methods

**`sincereHook`**`(callback=) : function()`

Set before-the-assertion-throws callback.
Falsy value sets internal do-nothing function; undefined value
is just ignored. **Returns** previous callback.

This interface has no effect in production environment.

**`sincereReset`**`()`

Resets internal seed variable for `sincereId` property. It is intended for testing only
and has no effect in production environment.

### Instance properties
**`className`**`: string` - actual class name, like `'MyClass'` above (read-only).

**`sincereId`**`: string` - generated by constructor; something like `'MyClass#42'`.

### Instance methods

**`assert`**`(value: *, locus: string, …args) : *`

A wrapper method around the native `assert`. Returns the `value`, if it is truthy - e.g. assertion does not fire.
If assertion fails, then `args` are processed by native `util.format` and `util.inspect` functions,
so the first arg may be format string.

**`sincereMessage`**`(locus: string, args: Array<*>) : string`

Compose a diagnostic message with instance id.
