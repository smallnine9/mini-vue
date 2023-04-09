import { baseParse } from '../src/parse'
import { NodeTypes } from '../src/ast'
describe('compiler: parse', () => {
    test('parse element', () => {
        const ast = baseParse('<div></div>')
        console.log(ast)
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

})