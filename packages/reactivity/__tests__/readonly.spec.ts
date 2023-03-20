import { readonly, isReadonly, shallowReadonly } from '../src/reactive'
import * as Effect from '../src/effect'
jest.mock('../src/effect')
describe('readonly', () => {
  it('happy path', () => {
    const obj = { foo: 1 }
    const objReadonly = readonly(obj)
    expect(objReadonly).not.toBe(obj)
    expect(objReadonly.foo).toBe(1)
  })

  it('you can not modify the readonly object', () => {
    const obj = { foo: 1 }
    console.warn = jest.fn()
    const objReadonly = readonly(obj)
    objReadonly.foo = 2
    objReadonly.foo
    expect(console.warn).toHaveBeenCalled()
    expect(Effect.track).not.toHaveBeenCalled()
  })

  it('isReadonly', () => {
    const obj = { foo: 1 }
    const objReadonly = readonly(obj)
    expect(isReadonly(objReadonly)).toBe(true)
    expect(isReadonly(obj)).toBe(false)
  })

  it('nested readonly', () => {
    const obj = {
      foo: 1,
      bar: {
        baz: 2
      }
    }
    const objReadonly = readonly(obj)
    console.warn = jest.fn()
    objReadonly.bar.baz = 3
    expect(console.warn).toHaveBeenCalled()
    expect(isReadonly(objReadonly.bar)).toBe(true)
    expect(isReadonly(obj.bar)).toBe(false)
  })

  it('shallowReadonly', () => {
    const obj = {
      foo: 1,
      bar: {
        baz: 2
      }
    }
    const objReadonly = shallowReadonly(obj)
    console.warn = jest.fn()
    objReadonly.bar.baz = 3
    expect(console.warn).not.toHaveBeenCalled()
    expect(isReadonly(objReadonly.bar)).toBe(false)
    expect(isReadonly(obj.bar)).toBe(false)
  })
})