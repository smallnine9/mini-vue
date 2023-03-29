import { createVNode } from '../src/vnode'

export function createAppAPI(render) {
  return function creaateApp(rootComponent) {
    const app =  {
      mount(rootContainer) {
        const vnode = createVNode(rootComponent)
        render(vnode, rootContainer)
      }
    }
    return app
  }
}