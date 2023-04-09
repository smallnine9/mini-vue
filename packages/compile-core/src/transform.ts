export function transform(root, options) {
    const context = createTransformContext(root, options)
    traverseNode(root, context)
}

// 深度优先遍历
function traverseNode(node, context) {
    const { nodeTransforms } = context
    for(let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i]
        transform(node)
    }
    traverseChildren(node, context)
}

function traverseChildren(node, context) {
    const { children } = node
    if(!children) return
    for(let i = 0; i < children.length; i++) {
        traverseNode(children[i], context)
    }
}

function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || []
    }
    return context
}