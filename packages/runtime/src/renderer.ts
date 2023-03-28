import { createComponentInstance, setupComponent } from "./component"
import { shapeFlags } from "../../shared/shapeFlags"
import { Fragment, Text } from "./vnode"
export function patch(vnode, container, parentComponent) {
  const { shapeFlag, type } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & shapeFlags.ELEMENT) {
        // 普通的元素
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
        // 组件
        processComponent(vnode, container, parentComponent)
      }
  }
}

export function processFragment(vnode, container, parentComponent) {
  const { children } = vnode
  children.forEach(child => {
    patch(child, container, parentComponent)
  })
}

export function processComponent(vnode, container, parent) {
  mountComponent(vnode, container, parent)
}

function mountComponent(vnode, container, parentComponent) {
  const instance = createComponentInstance(vnode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance, vnode, container) {
  const subTree = instance.render.call(instance.proxy)
  patch(subTree, container, instance)
  vnode.el = subTree.el
}

function processElement(vnode, container, parentComponent) {
  const el = (vnode.el = document.createElement(vnode.type))
  if (vnode.props) {
    patchProps(el, vnode.props)
  }
  const { shapeFlag } = vnode
  if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode.children, el, parentComponent)
  } else if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
    el.textContent = vnode.children
  }
  container.appendChild(el)
}

function mountChildren(children, container, parentComponent) {
  children.forEach(child => {
    patch(child, container, parentComponent)
  })
}

function patchProps(el: any, props: any) {
  for (let key in props) {
    const isOn = /^on[A-Z]/.test(key)
    if (isOn) {
      const func = props[key]
      el.addEventListener(key.slice(2).toLocaleLowerCase(), func)
    } else {
      el.setAttribute(key, props[key])
    }
  }
}
function processText(vnode: any, container: any) {
  container.appendChild(document.createTextNode(vnode.children))
}

