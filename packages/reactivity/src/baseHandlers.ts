import { track, trigger } from './effect'
import { ReactiveFlags, readonly, reactive } from './reactive'
import { isObject } from '../../shared/index'

function createGetters(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    if(key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if(key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const res = Reflect.get(target, key, receiver)

    if(!isReadonly) {
      track(target, key)
    }
    if(isShallow) {
      return res
    }
    if(isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

function createSetters() {
  return function set(target, key, value, receiver) {
    Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return true
  }
}

const get = createGetters(false)
const set = createSetters()
const readonlyGet = createGetters(true)
const shallowReactiveGet = createGetters(false, true)
const shallowReadonlyGet = createGetters(true, true)

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get:readonlyGet,
  set(target, key) {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target)
    return true
  }
}

export const shallowReactiveHandlers = {
  get: shallowReactiveGet,
  set
}

export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set(target, key) {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target)
    return true
  }
}
