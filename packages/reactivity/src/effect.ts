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
      if(effect._options && effect._options.scheduler) {
        effect._options.scheduler(effect)
      } else {
        effect.run()
      }
    })
  }
}

class ReactiveEffect {
  private _fn: Function
  private _options: any
  constructor(fn: Function, options?: any) {
    this._fn = fn
    this._options = options
  }
  run() {
    activeEffect = this
    this._fn()
    activeEffect = null
  }
}
export function effect(fn: Function, options?: any) {
  const _effect = new ReactiveEffect(fn, options)
  if( !options || !options.lazy ) {
    _effect.run()
  }
  return _effect.run.bind(_effect)
  
}