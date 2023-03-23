import { isObject } from "../../shared"
import { PublicInstanceProxyHandlers } from "./componentPublicinstance"

export function createComponentInstance(vnode) {
  const instance = {
    type: vnode.type,
    props: {},
    subTree: null,
    vnode
  }
  return instance
}

export function setupComponent(instance){
  // Todo 函数式组件没有state
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const component = instance.type
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers)
  const setup = component.setup
  if(setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  if(isObject(setupResult)) {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function  finishComponentSetup(instance) {
  const component = instance.type
  console.log(component)
  if(component.render){
    instance.render = component.render
  }
}
