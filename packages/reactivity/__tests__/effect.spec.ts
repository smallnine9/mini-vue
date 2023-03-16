import { effect } from '../src/effect'
import { reactive } from '../src/reactive'

describe('effect', () => {
  it('happy path', () => {
    const obj = reactive({ foo: 1 })
    let dummy: any
    effect(() => {
      dummy = obj.foo
    })
    expect(dummy).toBe(1)
    obj.foo = 2
    expect(dummy).toBe(2)
  })
})