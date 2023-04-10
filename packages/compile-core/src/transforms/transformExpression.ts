import { NodeTypes } from "../ast";
// {
//   type: INTERPOLATION,
//   content: {
//     type: SIMPLE_EXPRESSION,
//     content: message
//   }
// }
export function transformExpression(node) {
  if(node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content)
  }
}

function processExpression(node) {
  node.content = `_ctx.${node.content}`
  return node
}