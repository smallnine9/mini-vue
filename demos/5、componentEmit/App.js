import { h } from '../../dist/mini-vue.esm.js'
import Foo from './Foo.js'
const App = {
  name: 'HelloWorld',
  render() {
    window.helloworld = this
    return h(
      'div',
      {
        id: 'root',

      },
      [
        h(
          'div',
          {},
          'hello, ' + this.msg
        ),
        h(
          Foo,
          {
            onAdd(...args) {
              console.log('onAdd', ...args)
            },
            onAddFoo(...args) {
              console.log('onAddFoo', ...args)
            },
            onPlus(...args) {
              console.log('onPlus', ...args)
            }
          }
        )
      ]
    )
  },
  setup() {
    return {
      msg: 'world'
    }
  }
}
export default App
