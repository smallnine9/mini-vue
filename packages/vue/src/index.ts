export * from '@mini-vue/runtime-dom'

import { registerRuntimeCompiler } from "@mini-vue/runtime-dom"

import { baseCompile } from "@mini-vue/compile-core"

import * as runtimeDom from "@mini-vue/runtime-dom"

function complileToFunction(template) {
  // Todo 编译模板
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)
  return render
}

registerRuntimeCompiler(complileToFunction)