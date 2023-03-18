import { readonly } from '../src/reactive'
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
})