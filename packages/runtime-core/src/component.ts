import { shallowReadonly, proxyRefs } from "../../reactivity/src/index"
import { isObject } from "../../shared"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicinstance"
import { emit } from './componentEmit'
import { initSlots } from "./componentSlots"

let currentInstance = null
export function createComponentInstance(vnode, parent) {
  const instance = {
    type: vnode.type,
    props: {},
    subTree: null,
    setupState: {},
    provides: parent ? parent.provides : {},
    emit: () => { },
    parent,
    vnode,
    component: null,
    next: null,
    isMounted: false
  }
  instance.emit = emit.bind(null, instance) as any
  return instance
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  // Todo 函数式组件没有state
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  currentInstance = instance
  const component = instance.type
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
  const setup = component.setup
  if (setup) {
    const emit = instance.emit
    const setupResult = setup(shallowReadonly(instance.props), { emit })
    handleSetupResult(instance, setupResult)
  }
  currentInstance = null
}

function handleSetupResult(instance, setupResult) {
  if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const component = instance.type
  if (component.render) {
    instance.render = component.render
  }
}

export function getCurrentInstance() {
  return currentInstance
}