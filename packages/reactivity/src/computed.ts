import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _getter: () => any
  private _value: any
  private _effect: ReactiveEffect
  public _dirty = true
  constructor(getter) {
    this._effect = new ReactiveEffect(getter, { scheduler: () => {
      this._dirty = true
    }})
  }
  get value() {
    if(this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}
export const computed = function (fn) {
  return new ComputedRefImpl(fn)
}