import { createComponentInstance, setupComponent } from "./component"
import { shapeFlags } from "../../shared/shapeFlags"
import { Fragment, Text } from "./vnode"
import { createAppAPI } from "./createApp"

export function createRenderer(options) {
  const { createElement, patchProp, insert } = options
  function render(vnode, container) {
    if(vnode) {
      patch(vnode, container, null)
    } else {
      container.innerHTML = ''
    }
  }
  
  function patch(vnode, container, parentComponent) {
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
  
  function processFragment(vnode, container, parentComponent) {
    const { children } = vnode
    children.forEach(child => {
      patch(child, container, parentComponent)
    })
  }
  
  function processComponent(vnode, container, parent) {
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
  
  function processElement(
    vnode,
    container,
    parentComponent
  ) {
    mountElement(vnode, container, parentComponent)
  }
  
  function mountElement(
    vnode: any,
    container: any,
    parentComponent: any
  ) {
    //const el = (vnode.el = document.createElement(vnode.type))
    const el = (vnode.el = createElement(vnode.type))
    if (vnode.props) {
      patchProp(el, vnode.props)
    }
    const { shapeFlag } = vnode
    if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent)
    } else if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      el.textContent = vnode.children
    }
    insert(el, container)
    //container.appendChild(el)
  }
  
  function mountChildren(children, container, parentComponent) {
    children.forEach(child => {
      patch(child, container, parentComponent)
    })
  }
  
  function processText(vnode: any, container: any) {
    container.appendChild(document.createTextNode(vnode.children))
  }
  return {
    createApp: createAppAPI(render) //调用createAppAPI函数，传入render函数，返回createApp函数
  }
}
