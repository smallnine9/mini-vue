const publicPropertiesMap = {
  $el: (i) => i.vnode.el
}
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState } = instance
    if (key in setupState) {
      return Reflect.get(setupState, key)
    }
    if (key in publicPropertiesMap) {
      return publicPropertiesMap[key](instance)
    }
  }
}