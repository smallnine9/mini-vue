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
  it('lazy', () => { 
    const obj = reactive({ foo: 1 })
    let dummy: any
    let run = effect(
      () => {
        dummy = obj.foo
      },
      { lazy: true }
    )
    expect(dummy).toBe(undefined)
    run()
    expect(dummy).toBe(1)
    obj.foo = 2
    expect(dummy).toBe(2)
  })
  it('scheduler', () => {
    const obj1 = reactive({ foo: 1 })
    let run: any
    let dummy: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const runner = effect(
      () => {
        dummy = obj1.foo
      },
      {
        scheduler
      }
    )
    expect(dummy).toBe(1)
    expect(scheduler).not.toHaveBeenCalled()
    obj1.foo++
    expect(dummy).toBe(1)
    expect(scheduler).toHaveBeenCalledTimes(1)
    run()
    expect(dummy).toBe(2)
  })

})