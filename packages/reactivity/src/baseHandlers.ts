import { track, trigger } from './effect'

function createGetters(isReadonly = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
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