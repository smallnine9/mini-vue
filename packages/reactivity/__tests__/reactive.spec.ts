import { effect } from '../src/effect'
import { reactive, isReactive, shallowReactive } from '../src/reactive'

describe('reactive', () => {
  it('happy path', () => {
    const obj = { foo: 1 }
    const objObserve = reactive(obj)
    expect(objObserve.foo).toBe(1)
    expect(objObserve).not.toBe(obj)
  })
  it('readonly', () => {
    const obj = { foo: 1 }
    const objObserve = reactive(obj)
    expect(isReactive(objObserve)).toBe(true)
    expect(isReactive(obj)).toBe(false)
  })
  it('nested reactive', () => {
    const obj = {
      foo: 1,
      bar: {
        baz: 2
      }
    }
    const objObserve = reactive(obj)
    let dummy = 0
    effect(() => {
      dummy = objObserve.bar.baz
    })
    expect(isReactive(objObserve.bar)).toBe(true)
    expect(isReactive(obj.bar)).toBe(false)
    expect(dummy).toBe(2)
  })
  it('shallowReactive', () => {
    const obj = {
      foo: 1,
      bar: {
        baz: 2
      }
    }
    const objObserve = shallowReactive(obj)
    let dummy = 0
    effect(() => {
      dummy = objObserve.bar.baz
    })
    expect(isReactive(objObserve.bar)).toBe(false)
    expect(isReactive(obj.bar)).toBe(false)
    objObserve.bar.baz = 3
    expect(dummy).toBe(2)
  })
})