'use strict'
process.env.NODE_ENV = 'test'

const ME = 'Sincere'

const { expect } = require('chai')
const { AssertionError } = require('assert')
const { resolve } = require('path')
const path = resolve(ME + '.js')
const oldEnv = process.env.NODE_ENV
const purge = () => delete require.cache[path]

let o1, trace, Derived, Sincere, mode

const callback = function (loc, args) {
  trace.push({ inst: this, loc, args })
}

const load = (env) => {
  purge()
  process.env.NODE_ENV = mode = env
  Sincere = require(path)

  Derived = class D extends Sincere {
    get sincereId () {  //  Attempt to override should not have effect.
      return super.sincereId + '!'
    }
  }
}

const constructorTest = () => {
  expect(Object.keys(o1)).to.eql([], 'enumerable properties')
  expect(o1.sincereId).to.equal('D#0', 'sincereId-1')
  if (mode === 'test') {
    Sincere.reset()
  } else {
    expect(() => Sincere.reset()).to.throw('not a function')
  }
  const o2 = new Sincere()
  expect(o2.sincereId).to.equal(mode === 'test' ? 'Sincere#0' : 'Sincere#1')
  expect(o1.className).to.equal('D')
  expect(o2.className).to.equal('Sincere')
  expect(o1.sincereMessage('foo')).to.equal('D#0.foo')
  expect(Sincere.hook()).to.equal(false, 'hook')
}

const assertionTest = () => {
  expect(Sincere.hook(callback)).to.equal(false)
  expect(o1.assert('data', 'never')).to.equal('data', 'assertion ok')
  expect(() => o1.assert(0, 'test', 1)).to
    .throw(AssertionError, /D#\d+\.test: 1$/)
  if (mode === 'production') {
    expect(trace).to.eql([])
    expect(Sincere.hook('bad')).to.equal(false)
    return
  }
  expect(trace).to.eql([{ args: [1], inst: o1, loc: 'test' }])
  expect(() => Sincere.hook('bad')).to.throw(TypeError, /not a function/)
}

describe(ME, () => {
  after(purge)

  beforeEach(() => {
    if (mode === 'test') Sincere.reset()
    Sincere.hook(false)
    trace = []
    o1 = new Derived()
  })

  describe('production mode', () => {
    before(() => load('production'))

    it('should construct', constructorTest)
    it('should assert', assertionTest)
  })

  describe('development mode', () => {
    before(() => load('development'))

    it('should construct', constructorTest)
    it('should assert', assertionTest)
  })

  describe('test mode', () => {
    before(() => load(oldEnv))

    it('should construct', constructorTest)
    it('should assert', assertionTest)
  })
})
