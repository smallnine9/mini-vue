import { reactive, isReactive } from '../src/reactive'

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
})