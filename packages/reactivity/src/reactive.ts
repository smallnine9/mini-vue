import { readonlyHandlers, mutableHandlers } from './baseHandlers'

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