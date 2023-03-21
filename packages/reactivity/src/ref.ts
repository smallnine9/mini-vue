import { trackEffects, triggerEffects } from './effect'
import {reactive} from './reactive'
import { hasChanged } from '../../shared/index'
class RefImpl {
  private _value
  private dep
  public __v_isRef = true
  constructor(value) {
    if(typeof value === 'object') {
      this._value = reactive(value)
    } else {
      this._value = value
    }
    this.dep = new Set()
  }
  get value() {
    trackEffects(this.dep)
    return this._value
  }
  set value(newValue) {
    if(!hasChanged(this._value, newValue)) {
      return
    }
    this._value = newValue
    triggerEffects(this.dep)
  }
}
export function ref(value) {
  return new RefImpl(value)
}

export function isRef(target) {
  return !!target.__v_isRef
}

export function unRef(target) {
  return isRef(target) ? target.value : target
}