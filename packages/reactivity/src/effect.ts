let activeEffect: any

const targetMap = new WeakMap()
export function track(target: any, key: String | Symbol) {
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    targetMap.set(target, depsMap = new Map())
  }
  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, dep = new Set())
  }
  if(activeEffect) {
    dep.add(activeEffect)
  }
}

export function trigger(target, key) {
  const depMap = targetMap.get(target)
  if(!depMap) {
    return
  }
  const dep = depMap.get(key)
  if(dep) {
    dep.forEach(effect => {
      effect.run()
    })
  }
}

class ReactiveEffect {
  private _fn: Function
  constructor(fn: Function) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    this._fn()
    activeEffect = null
  }
}
export function effect(fn: Function) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}