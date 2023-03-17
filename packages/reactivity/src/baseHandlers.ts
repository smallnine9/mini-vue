import { track, trigger } from './effect'

function createGetters() {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    track(target, key)
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

const get = createGetters()
const set = createSetters()

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get,
  set(target, key) {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target)
    return true
  }
}