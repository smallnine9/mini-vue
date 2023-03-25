import { shallowReadonly } from "../../reactivity/src/reactive"
import { isObject } from "../../shared"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicinstance"
import { emit } from './componentEmit'

export function createComponentInstance(vnode) {
  const instance = {
    type: vnode.type,
    props: {},
    subTree: null,
    setupState: {},
    emit: () => { },
    vnode
  }
  instance.emit = emit.bind(null, instance) as any
  return instance
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  // Todo 函数式组件没有state
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const component = instance.type
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
  const setup = component.setup
  if (setup) {
    const emit = instance.emit
    const setupResult = setup(shallowReadonly(instance.props), { emit })
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  if (isObject(setupResult)) {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const component = instance.type
  if (component.render) {
    instance.render = component.render
  }
}
