import { createVNode } from './vnode'
import { shapeFlags } from '../../shared/shapeFlags'
export function initSlots(
  instance,
  children
) {
  const { vnode } = instance
  if (vnode.shapeFlag & shapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, (instance.slots = {}))
  }
}

function normalizeObjectSlots(
  rawSlots,
  slots
) {
  for(const key in rawSlots) {
    const value = rawSlots[key]
    if(typeof value === 'function') {
      slots[key] = (props) => normalizeSlotValue(value(props))
    }
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? createVNode('div', null, value) : value
}