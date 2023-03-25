import { isObject } from '../../shared'
import { readonlyHandlers, mutableHandlers, shallowReactiveHandlers, shallowReadonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}
function createReactiveObject(target, baseHandlers) {
  if(!isObject(target)) {
    return target
  }
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

export function shallowReactive(target) {
  return createReactiveObject(target, shallowReactiveHandlers)
}

export function shallowReadonly(target) {
  return createReactiveObject(target, shallowReadonlyHandlers)
}