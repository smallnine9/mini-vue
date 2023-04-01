import { createComponentInstance, setupComponent } from "./component"
import { shapeFlags } from "../../shared/shapeFlags"
import { Fragment, Text } from "./vnode"
import { createAppAPI } from "./createApp"
import { effect } from "@mini-vue/reactivity"

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    setElementText: hostSetElementText,
    remove: hostRemove
  } = options
  function render(
    vnode,
    container
  ) {
    if (vnode) {
      patch(null, vnode, container, null, null)
    } else {
      container.innerHTML = ''
    }
  }

  //n1 -> old vnode  n2 -> new vnode
  function patch(
    n1,
    n2,
    container,
    anchor = null,
    parentComponent = null
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
          processElement(n1, n2, container, anchor, parentComponent)
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          // 组件
          processComponent(n1, n2, container, parentComponent)
        }
    }
  }

  function processFragment(n1, n2, container, parentComponent) {
    const { children } = n2
    children.forEach(child => {
      patch(null, child, container, null, parentComponent)
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
    container
  ) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('effect mounted!')
        const subTree = (instance.subTree = instance.render.call(instance.proxy))
        patch(null, subTree, container, null, instance)
        vnode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log('effect update!')
        const prevSubTree = instance.subTree
        const subTree = (instance.subTree = instance.render.call(instance.proxy))
        patch(prevSubTree, subTree, container, null, instance)
      }
    })
  }

  function processElement(
    n1,
    n2,
    container,
    anchor,
    parentComponent
  ) {
    console.log('processelement')
    if (!n1) {
      mountElement(n2, container, anchor, parentComponent)
    } else {
      updateElement(n1, n2, container)
    }
  }

  function mountElement(
    vnode: any,
    container: any,
    anchor,
    parentComponent: any
  ) {
    //const el = (vnode.el = document.createElement(vnode.type))
    const el = (vnode.el = hostCreateElement(vnode.type))
    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key]
        hostPatchProp(el, key, null, value)
      }
    }
    const { shapeFlag } = vnode
    if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent)
    } else if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children)
    }
    hostInsert(el, container, anchor)
    //container.appendChild(el)
  }

  function updateElement(
    n1,
    n2,
    container,
  ) {
    // patch props
    const oldProps = n1.props
    const newProps = n2.props
    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps)
    // patch children
    patchChildren(n1, n2, el)
  }

  function patchChildren(
    n1,
    n2,
    container
  ) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1
    const { shapeFlag: ShapeFlag, children: c2 } = n2
    if (ShapeFlag & shapeFlags.TEXT_CHILDREN) {
      if(prevShapeFlag & shapeFlags.ARRAY_CHILDREN) {
        unMountChildren(c1, container)
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else if (ShapeFlag & shapeFlags.ARRAY_CHILDREN) {
      if (prevShapeFlag & shapeFlags.TEXT_CHILDREN) {
        hostCreateElement(container, '')
        mountChildren(c2, container, null)
      } else {
        patchKeyedChildren(c1, c2, container)
        // array to array
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container
  ) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    while (i <= e1 && i <= e2) {
      if (isSameVnodeType(c1[i], c2[i])) {
        patch(c1[i], c2[i], container, null, null)
        i++
      } else {
        break
      }
    }
    console.log('i:', i)
    while(i <= e1 && i <= e2) {
      if (isSameVnodeType(c1[e1], c2[e2])) {
        patch(c1[e1], c2[e2], container, null, null)
        e1--
        e2--
      } else {
        break
      }
    }
    console.log('e1:', e1, 'e2:', e2)
    let anchorIndex = e2 + 1
    let anchor = anchorIndex < c2.length ? c2[anchorIndex].el : null
    // i > e1 说明新的children更长,有新增的节点
    if (i > e1) {
      while(i <= e2) {
        patch(null, c2[i], container, anchor, null)
        i++
      }
    } else if (i > e2) {
      while(i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
      // i > e2 说明旧的children更长,有删除的节点
    } else {
      
    }
  }

  function isSameVnodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
  }

  function unMountChildren(
    children,
    container
  ) {
    for (const child of children) {
      container.removeChild(child.el)
    }
  }

  function patchProps(
    el,
    oldProps,
    newProps
  ) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }

  function mountChildren(
    children,
    container,
    parentComponent
  ) {
    children.forEach(child => {
      patch(null, child, container, null, parentComponent)
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
