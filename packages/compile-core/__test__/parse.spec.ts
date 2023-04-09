import { baseParse } from '../src/parse'
import { NodeTypes } from '../src/ast'
describe('compiler: parse', () => {
    test('parse element', () => {
        const ast = baseParse('<div></div>')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'div',
            children: []
        })
    })

    test('parse text', () => {
        const ast = baseParse('hello world<div></div>')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.TEXT,
            content: 'hello world'
        })
    })

    test('parse nested element', () => {
        const ast = baseParse('<div><p></p></div>')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'div',
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: 'p',
                    children: []
                }
            ]
        })
    })

    // test.only('parse error', () => {
    //     expect(() => {
    //         baseParse('<div></p>')
    //     }).toThrow('缺少结束标签:div')
    // })

    test('parse error', () => {
        expect(() => {
            baseParse('<div><span></div>')
        }).toThrow('缺少结束标签:span')
    })

    test("Nested element ", () => {
        const ast = baseParse("<div><p>hi</p></div>");

        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "div",
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: "p",
                    children: [
                        {
                            type: NodeTypes.TEXT,
                            content: "hi",
                        },
                    ],
                }
            ],
        });
    });

    test("simple interpolation", () => {
        const ast = baseParse("{{ message }}");
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.INTERPOLATION,
            content: {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: "message",
            },
        });
    });

    test('text and interpolation', () => {
        const ast = baseParse('hi {{ message }}')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.TEXT,
            content: 'hi '
        })
        expect(ast.children[1]).toStrictEqual({
            type: NodeTypes.INTERPOLATION,
            content: {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: 'message'
            }
        })
    })

    test('complex', () => {
        const ast = baseParse('<div><p>hi</p><span>{{ message }}</span></div>')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'div',
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: 'p',
                    children: [{
                        type: NodeTypes.TEXT,
                        content: 'hi'
                    }]
                },
                {
                    type: NodeTypes.ELEMENT,
                    tag: 'span',
                    children: [{
                        type: NodeTypes.INTERPOLATION,
                        content: {
                            type: NodeTypes.SIMPLE_EXPRESSION,
                            content: 'message'
                        }
                    }]
                }
            ]
        })
    })
})