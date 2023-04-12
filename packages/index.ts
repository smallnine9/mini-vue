export * from './reactivity/src/index'

export * from './runtime-core/src/index'

export * from './runtime-dom/src/index'

import { registerRuntimeCompiler } from "./runtime-dom/src"

import { baseCompile } from "./compile-core/src"

import * as runtimeDom from "./runtime-dom/src"

function complileToFunction(template) {
  // Todo 编译模板
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)
  return render
}

registerRuntimeCompiler(complileToFunction)