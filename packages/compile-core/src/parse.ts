import { isEnumDeclaration } from "typescript";
import { NodeTypes } from "./ast";

const enum TagType {
    START,
    END
}
export function baseParse(content) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context, []))
}

function createParserContext(content) {
    return {
        source: content
    }
}
function advanceBy(context, length) {
    context.source = context.source.slice(length)
}

function parseChildren(context, ancestors) {
    const nodes: any = []
    while (!isEnd(context, ancestors)) {
        let node
        const s = context.source
        if (s.startsWith('<')) {
            if (/[a-z]/.test(s[1])) {
                node = parseElement(context, ancestors)
            }
        } else if (context.source.startsWith('{{')) {
            node = parseInterpolation(context)
        }
        if (!node) {
            node = parseText(context)
        }
        nodes.push(node)

    }
    return nodes
}

function isEnd(context, ancestors) {
    const s = context.source
    if (s.startsWith('</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag
            if (tag && startWithEndTagOpen(s, tag)) {
                return true
            }
        }
    }
    return !s
}

function parseInterpolation(context) {
    const openDelimiter = '{{'
    const endDelimiter = '}}'
    const endIndex = context.source.indexOf(
        endDelimiter,
        endDelimiter.length
    )
    advanceBy(context, openDelimiter.length)
    const rawContentLength = endIndex - openDelimiter.length
    const rawContent = parseTextData(context, rawContentLength)
    const content = rawContent.trim()
    advanceBy(context, endDelimiter.length)
    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content
        }
    }
}

function parseText(context) {
    const endTag = ['<', '{{']
    let endIndex = context.source.length
    for(let i = 0; i < endTag.length; i++) {
        let index = context.source.indexOf(endTag[i])
        if(index !== -1 && index < endIndex) {
            endIndex = index
        }
    }
    const text = parseTextData(context, endIndex)
    return {
        type: NodeTypes.TEXT,
        content: text
    }
}

function parseTextData(context, length) {
    const text = context.source.slice(0, length)
    advanceBy(context, length)
    return text
}


function createRoot(children) {
    return {
        type: NodeTypes.ROOT,
        children
    }
}

function parseElement(context: any, ancestors: any) {
    //<div></div>
    const element: any = parseTag(context, TagType.START)
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    ancestors.pop(element)
    if (startWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.END)
    } else {
        throw new Error(`缺少结束标签:${element.tag}`)
    }
    return element
}

function startWithEndTagOpen(source, tag) {
    return source.slice(2, 2 + tag.length) === tag
}

function parseTag(context, type: TagType) {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source)
    const tag = match[1]
    advanceBy(context, match[0].length)
    advanceBy(context, 1)
    if (type === TagType.END) return
    return {
        type: NodeTypes.ELEMENT,
        tag
    }
}


