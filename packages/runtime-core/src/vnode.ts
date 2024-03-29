import { shapeFlags } from '../../shared/shapeFlags'
import { isObject } from '../../shared'

export const Fragment = Symbol('v-fgt')
export const Text = Symbol('v-text')

export { createVNode as createElementVNode }
export function createVNode(type, props?, children?) {
  return {
    type,
    props,
    key: props && props.key,
    children,
    el: null,
    shapeFlag: getShapeFlag(type, children)
  }
}

function getShapeFlag(type, children) {
  let shapeFlag = 0
  if(typeof type === 'string') {
    shapeFlag |= shapeFlags.ELEMENT
  }
  if(isObject(type)) {
    shapeFlag |= shapeFlags.STATEFUL_COMPONENT
  }
  if(typeof children === 'string' || typeof children === 'number') {
    shapeFlag |= shapeFlags.TEXT_CHILDREN
  }
  if(Array.isArray(children)) {
    shapeFlag |= shapeFlags.ARRAY_CHILDREN
  }
  if(children && isObject(children)) {
    shapeFlag |= shapeFlags.SLOTS_CHILDREN
  }
  return shapeFlag
}

export function createTextVnode(text) {
  return createVNode(Text, null, text)
}