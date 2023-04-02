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
      updateElement(n1, n2, container, anchor)
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
    anchor
  ) {
    // patch props
    const oldProps = n1.props
    const newProps = n2.props
    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps)
    // patch children
    patchChildren(n1, n2, el, anchor)
  }

  function patchChildren(
    n1,
    n2,
    container,
    anchor
  ) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1
    const { shapeFlag: ShapeFlag, children: c2 } = n2
    if (ShapeFlag & shapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & shapeFlags.ARRAY_CHILDREN) {
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
        patch(c1[i], c2[i], container, null)
        i++
      } else {
        break
      }
    }
    console.log('i:', i)
    while (i <= e1 && i <= e2) {
      if (isSameVnodeType(c1[e1], c2[e2])) {
        patch(c1[e1], c2[e2], container, null)
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
      while (i <= e2) {
        patch(null, c2[i], container, anchor, null)
        i++
      }
    } else if (i > e2) {
      // i > e2 说明旧的children更长,有删除的节点
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      let s1 = i, s2 = i
      let moved = false
      let pos = 0
      let toBePatched = e2 - s2 + 1
      const newKeyIndexMap = new Map()
      for (let i = s2; i <= e2; i++) {
        newKeyIndexMap.set(c2[i].key, i)
      }
      const newIndexToOldIndexMap = new Array(e2 - s2 + 1).fill(0)
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        //先处理有key的情况
        let newIndex
        if (prevChild.key != null) {
          newIndex = newKeyIndexMap.get(prevChild.key)
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSameVnodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }
        // 如果在新的vnode里面没找到prevChild,说明这个vnode对应的dom元素要被删除了
        if (newIndex === undefined) {
          hostRemove(prevChild.el)
        } else { //如果找到了
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          // newIndexToOldIndexMap这个数组如果不是递增的话，就说明需要移动
          // 也就是newIndex应该要越来越大
          if (newIndex < pos) {
            moved = true
          } else {
            pos = newIndex
          }
          // 先打个补丁，更新内容，位置在后面调整
          patch(prevChild, c2[newIndex], container, null, null)
        }
      }
      // 获取最长子序列对应的下标
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let j = increasingNewIndexSequence.length - 1

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i
        let nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el :  null
        //需要新建
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, anchor, null)
        } else if (moved) {
          if (i !== increasingNewIndexSequence[j]) {
            //需要移动
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  // arr数组保存的是待更新的c2结点在c1中对应的index，比如说c2[i] 代表的是c2中的第i个结点, 在c1中的下标，如果不存在，则是0
  function getSequence(arr: number[]): number[] {
    const p = arr.slice()
    const result = [0] as any
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        j = result[result.length - 1] //result[i] 保存的是，长度为i+1的递增子序列的最小结尾元素的下标
        if (arr[j] < arrI) { // 发现了新的满足递增的结尾元素，扩展result数组
          p[i] = j    //此时p[i] 保存的是arr[i] 在递增子序列中，它前一个元素的下标
          result.push(i)
          continue
        }
        u = 0
        v = result.length - 1
        //二分查找
        while (u < v) {
          c = (u + v) >> 1
          if (arr[result[c]] < arrI) {
            u = c + 1
          } else {
            v = c
          }
        }
        // 退出条件是u === v
        // 可以保证，u前面的元素都小于arrI
        // 判断arrI是否能成为新的最小结尾元素，如果能，更新result数组
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1]
          }
          // 发现了更小的最小结尾元素，更新  正是这一步，导致我们最后求出的result数组不是正确的下标
          // 2 5 6 4 最长递增子序列应该是 2 5 6，对应下标是0, 1, 2 但由于4会更新result[2]，导致最后求出的result数组是0, 3, 2
          // 所以我们引入了p数组，p数组保存了元素6在递增子序列中，前一个元素也就是元素5的下标, 我们可以修正result数组
          result[u] = i
        }
      }
    }
    // 从后向前遍历
    u = result.length
    v = result[u - 1] // v 获取最长递增子序列的最小结尾元素的下标
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
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
