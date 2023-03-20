import { track, trigger } from './effect'
import { ReactiveFlags, readonly, reactive } from './reactive'
import { isObject } from '../../shared/index'

function createGetters(isReadonly = false) {
  return function get(target, key, receiver) {
    if(key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if(key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const res = Reflect.get(target, key, receiver)
    if(isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    if(!isReadonly) {
      track(target, key)
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