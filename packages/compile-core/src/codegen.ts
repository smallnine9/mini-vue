import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers"
import { isString } from '../../shared/index'

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context
  genFunctionPreamble(ast, context)
  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')
  push(`function ${functionName}(${signature}){`)
  push('return ')
  genNode(ast.codegenNode, context)
  push('}')
  return {
    code: context.code
  }
}

function genFunctionPreamble(node, context) {
  const { push, helper } = context
  const VueBinging = 'Vue'
  const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`
  if (node.helpers.length > 0) {
    push(`const { ${node.helpers.map(aliasHelper).join(',\n')} } = ${VueBinging}`)
  }
  push('\n')
  push('return ')
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
  }
}

function genCompoundExpression(node, context) {
  const { push } = context
  const children = node.children
  for(let i = 0; i < children.length; i++) {
    const child = children[i]
    if(isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}

function genElement(node, context) {
  const { push, helper } = context
  const { tag, props, children } = node 
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  console.log(children)
  genNodeList(genNullable([tag, props, children]), context)
  push(")")
}

function genNodeList(children, context) {
  const { push } = context
  for(let i = 0; i < children.length; i++) {
    const child = children[i]
    if(isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
    if(i < children.length - 1) {
      push(', ')
    }
  }
}

function genNullable(args) {
  return args.map(arg => arg || 'null')
}

function genExpression(node, context) {
  const { push } = context
  push(node.content)
}

function genInterpolation(node, context) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

function genText(node, context) {
  const { push } = context
  push(`'${node.content}'`)
}

function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    }
  }
  return context
}