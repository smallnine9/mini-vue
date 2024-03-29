import { isExportDeclaration } from "typescript"
import { extend } from "../../shared"

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
  trackEffects(dep) 
}

export function trackEffects(dep) {
  if(activeEffect) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function trigger(target, key) {
  const depMap = targetMap.get(target)
  if(!depMap) {
    return
  }
  const dep = depMap.get(key)
  if(dep) {
    triggerEffects(dep)
  }
}
export function triggerEffects(dep) {
  dep.forEach(effect => {
    if(effect._options && effect._options.scheduler) {
      effect._options.scheduler(effect)
    } else {
      effect.run()
    }
  })
}
export class ReactiveEffect {
  private _options: any
  public deps: any[] = []
  private onStop ?: () => {}
  constructor(public fn, options?: any) {
    this._options = options
  }
  run() {
    activeEffect = this
    const res = this.fn()
    activeEffect = null
    return res
  }
  stop() {
    if(this.onStop) {
      this.onStop()
    }
    this.deps.forEach(dep => {
      dep.delete(this)
    })
  }
}

export function effect(fn: Function, options?: any) {
  const _effect = new ReactiveEffect(fn, options)
  extend(_effect, options)
  if( !options || !options.lazy ) {
    _effect.run()
  }
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
  
}

export function stop(runner) {
  runner.effect.stop()
}