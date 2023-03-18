import { readonlyHandlers, mutableHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}
function createReactiveObject(target, baseHandlers) {
  const observed = new Proxy(target, baseHandlers)
  return observed
}
export function reactive(target) {
  return createReactiveObject(target, mutableHandlers)
}

export function readonly(target) {
  return createReactiveObject(target, readonlyHandlers)
}

export function isReactive(target) {
  return !!target[ReactiveFlags.IS_REACTIVE] 
}

export function isReadonly(target) {
  return !!target[ReactiveFlags.IS_READONLY]
}