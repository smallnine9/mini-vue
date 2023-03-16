import { track, trigger } from './effect'
export function reactive(obj) {
  const objProxy = new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return true
    }
  })
  return objProxy
}