import { isObject } from "../../shared"
import { createComponentInstance, setupComponent } from "./component"
import { shapeFlags } from "../../shared/shapeFlags"

export function patch(vnode, container) {
  const { shapeFlag } = vnode
  if (shapeFlag & shapeFlags.ELEMENT) {
    // 普通的元素
    processElement(vnode, container)
  } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
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
  setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance, vnode, container) {
  const subTree = instance.render.call(instance.proxy)
  patch(subTree, container)
  vnode.el = subTree.el
}

function processElement(vnode, container) {
  const el = (vnode.el = document.createElement(vnode.type))
  if (vnode.props) {
    patchProps(el, vnode.props)
  }
  const { shapeFlag } = vnode
  if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode.children, el)
  } else if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
    el.textContent = vnode.children
  }
  container.appendChild(el)
}

function mountChildren(children, container) {
  children.forEach(child => {
    patch(child, container)
  })
}

function patchProps(el: any, props: any) {
  for (let key in props) {
    el.setAttribute(key, props[key])
  }
}
