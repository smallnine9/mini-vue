import { h } from '../../dist/mini-vue.esm.js'
import Foo from './Foo.js'
const App = {
  name: 'HelloWorld',
  render() {
    window.helloworld = this
    return h(
    'div', 
    { id: 'root' }, 
    [
      h(
        'div',
        {},
        'hello, ' + this.msg
      ),
      h(
        Foo,
        {count: 1},
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
