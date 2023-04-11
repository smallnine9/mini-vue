import { isText } from "../utils";
import { NodeTypes } from "../ast";

export function transformText(node) {
  if(node.type === NodeTypes.ELEMENT) {
    const { children } = node
    let currentContainer
    for(let i = 0; i < children.length; i++) {
      let child = children[i]
      if(isText(child)) {
        for(let j = i+1; j < children.length; j++) {
          let next = children[j]
          if(isText(next)) {
            if(!currentContainer) {
              currentContainer = children[i] = {
                type: NodeTypes.COMPOUND_EXPRESSION,
                children: [child]
              }
            }
            currentContainer.children.push(" + ")
            currentContainer.children.push(next)
            children.splice(j, 1)
            j--
          } else {
            currentContainer = undefined;
            break;
          }
        }
      }
    }
  }
}