import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING } from "./runtimeHelpers"

export function transform(root, options = {}) {
    const context = createTransformContext(root, options)
    traverseNode(root, context)
    createRootCodegen(root)
    root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root) {
  const child = root.children[0]
  if(child.type === NodeTypes.ELEMENT) {
    root.codegenNode = root.children[0].codegenNode
  } else {
    root.codegenNode = root.children[0]
  }
}

// 深度优先遍历
function traverseNode(node, context) {
    const { nodeTransforms } = context
    switch(node.type) {
      case NodeTypes.INTERPOLATION:
        context.helper(TO_DISPLAY_STRING)
        break
      case NodeTypes.ROOT:
      case NodeTypes.ELEMENT:
        traverseChildren(node, context)
        break
      default:
        break
    }
    for(let i = 0; i < nodeTransforms.length; i++) {
      const transform = nodeTransforms[i]
      transform(node, context)
    }
}

function traverseChildren(node, context) {
    const { children } = node
    for(let i = 0; i < children.length; i++) {
        traverseNode(children[i], context)
    }
}

function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
          context.helpers.set(key, 1)
        }
    }
    return context
}