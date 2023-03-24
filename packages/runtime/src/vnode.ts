import { shapeFlags } from '../../shared/shapeFlags'
import { isObject } from '../../shared'

export function createVNode(type, props?, children?) {
  return {
    type,
    props,
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
  if(typeof children === 'string') {
    shapeFlag |= shapeFlags.TEXT_CHILDREN
  }
  if(Array.isArray(children)) {
    shapeFlag |= shapeFlags.ARRAY_CHILDREN
  }
  return shapeFlag
}