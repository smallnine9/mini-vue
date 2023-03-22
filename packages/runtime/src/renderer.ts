import { isObject } from "../../shared"
import { createComponentInstance, setupComponent } from "./component"

export function patch(vnode, container) {
  if(typeof vnode.type === 'string') {
    // 普通的元素
    // Todo processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    // 组件
    processComponent(vnode, container)
  }
}
export function processComponent(vnode, container) {
  mountComponent(vnode, container)  
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode)
  console.log(instance)
  setupComponent(instance)
  setupRenderEffect(instance)
}

function setupRenderEffect(instance) {
  const subTree = instance.render()
}