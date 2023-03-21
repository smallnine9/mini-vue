import { trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'
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

const shallowUnWrapHandlers = {
  get(target, key) {
    return unRef(Reflect.get(target, key))
  },
  set(target, key, value) {
    const oldValue = target[key]
    if(isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    }
    return Reflect.set(target, key, value)
  }
}
export function proxyRefs(target) {
  return new Proxy(target, shallowUnWrapHandlers)
}