import { hasKey } from '../../shared/index'
const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots
}
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    if(hasKey(setupState, key)) {
      return Reflect.get(setupState, key)
    } else if(hasKey(props, key)) {
      return Reflect.get(props, key)
    }
    if (key in publicPropertiesMap) {
      return publicPropertiesMap[key](instance)
    }
  }
}