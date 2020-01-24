'use strict'
const native = require('assert')
const { format } = require('util')

//  istanbul ignore next
const assert = (native.strict || native).ok
const notProduction = process.env.NODE_ENV !== 'production'

let hook = false, seed = -1

/**
 * A base class for better diagnostics and easier debugging.
 *
 * @example
 * const Sincere = require('Sincere')
 *
 * Sincere.hook(() => {
 *   return 0     //  Set debugger breakpoint here.
 * }
 *
 * class MyClass extends Sincere {
 *   ...
 * }
 */
class Sincere {
  constructor () {
    this._className = /^(class|function)\s+(\w+)/
      .exec(this.constructor.toString())[2]
    this._id = this._className + '#' + ++seed
  }

  /**
   * Wrapper around Node.js native `assert.ok`.
   *
   * It composes informative error message for failed assertion and
   * invokes assertion hook function before assertion error is thrown.
   *
   * @param {*} condition
   * @param {string} locus - usually method name.
   * @param {...*} args    - the first may be format string.
   * @returns {*} condition value if it was truthy.
   */
  assert (condition, locus, ...args) {
    if (condition) return condition                //  Chain-able.
    if (notProduction && hook) {
      hook.call(this, locus, args)
    }
    assert(condition, this.sincereMessage(locus, args))
  }

  /**
   * Actual class name of the instance.
   * @type {string}
   */
  get className () {
    return this._className
  }

  /**
   * Sets a callback hook for assert() method.
   * @param {function()|boolean|undefined} callback has no effect in production.
   * @returns {*}  previous callback hook.
   */
  static hook (callback = undefined) {
    const old = hook
    if (notProduction && callback !== undefined) {
      if (callback && typeof callback !== 'function') {
        throw TypeError('Sincere.hook: not a function')
      }
      hook = callback
    }
    return old
  }

  /**
   * Unique instance id for diagnostic purposes.
   * @type {string}
   */
  get sincereId () {
    return this._id
  }

  /**
   * Compose a diagnostic message.
   *
   * @param {string} locus - usually a method name.
   * @param {Array<*>=} args - to be processed by Node.js 'util.format'
   * @returns {string} - sincereId + ['.' + locus] + [': ' + args]
   */
  sincereMessage (locus, args) {
    return this.sincereId + (locus ? '.' + locus : '') +
      ((args && args.length > 0) ? ': ' + format.apply(undefined, args) : '')
  }
}

if (process.env.NODE_ENV === 'test') {
  /**
   * Reset unique id generation seed. Available in test environment only.
   */
  Sincere.reset = () => (seed = -1)
}

module.exports = Sincere
