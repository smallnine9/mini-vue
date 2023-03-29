import { createComponentInstance, setupComponent } from "./component"
import { shapeFlags } from "../../shared/shapeFlags"
import { Fragment, Text } from "./vnode"
import { createAppAPI } from "./createApp"
import { effect } from "@mini-vue/reactivity"

export function createRenderer(options) {
  const { createElement, patchProp, insert } = options
  function render(
    vnode,
    container
  ) {
    if (vnode) {
      patch(null, vnode, container, null)
    } else {
      container.innerHTML = ''
    }
  }

  //n1 -> old vnode  n2 -> new vnode
  function patch(
    n1,
    n2,
    container,
    parentComponent
  ) {
    const { shapeFlag, type } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & shapeFlags.ELEMENT) {
          // 普通的元素
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          // 组件
          processComponent(n1, n2, container, parentComponent)
        }
    }
  }

  function processFragment(n1, n2, container, parentComponent) {
    const { children } = n2
    children.forEach(child => {
      patch(null, child, container, parentComponent)
    })
  }

  function processComponent(
    n1,
    n2,
    container,
    parent
  ) {
    if (!n1) {
      mountComponent(n2, container, parent)
    } else {
      //patchComponent
    }
  }

  function mountComponent(
    vnode,
    container,
    parentComponent
  ) {
    const instance = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
  }

  function setupRenderEffect(
    instance,
    vnode,
    container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('effect mounted!')
        const subTree = (instance.subTree = instance.render.call(instance.proxy))
        patch(null, subTree, container, instance)
        vnode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log('effect update!')
        const prevSubTree = instance.subTree
        const subTree = (instance.subTree = instance.render.call(instance.proxy))
        // patch(prevSubTree, subTree, container, instance)
      }
    })
  }

  function processElement(
    n1,
    n2,
    container,
    parentComponent
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      //patchElment
    }
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

  function mountChildren(
    children,
    container,
    parentComponent
  ) {
    children.forEach(child => {
      patch(null, child, container, parentComponent)
    })
  }

  function processText(
    n1,
    n2: any,
    container: any
  ) {
    container.appendChild(document.createTextNode(vnode.children))
  }
  return {
    createApp: createAppAPI(render) //调用createAppAPI函数，传入render函数，返回createApp函数
  }
}
