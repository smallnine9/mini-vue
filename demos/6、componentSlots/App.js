import { h } from '../../dist/mini-vue.esm.js'
import Foo from './Foo.js'
const App = {
  name: 'App',
  render() {
    // 1. 传入一个数组 或 传入一个虚拟节点
    //const foo = h(Foo, { msg: 'hello' }, [h('p', {}, 'foo slot'), h('p',{}, 'foo slot2')])
    //const foo = h(Foo, { msg: 'hello' }, h('p', {}, 'foo slot'))
    // 2. 具名插槽
    const foo = h(Foo, { msg: 'hello' }, {
      default: ({defaultValue}) => [h('p', {}, 'foo slot' + defaultValue), h('p', {}, 'foo slot2' +defaultValue)],
      header: ({headerValue}) => h('p', {}, 'header slot' + headerValue)
    })
    return h(
      'div',
      {
        id: 'root'
      },
      [foo]
    )
  },
  setup() {
    return {
      msg: 'world'
    }
  }
}
export default App
