import { createVNode } from '../src/vnode'
import { patch } from '../src/renderer'

export function createApp(rootComponent) {
  // ...
  return {
    mount(rootContainer) {
      const vnode = createVNode(rootComponent) 
      patch(vnode, rootContainer)
    }
  }
}