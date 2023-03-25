import { h } from '../../dist/mini-vue.esm.js'
const App = {
  name: 'HelloWorld',
  render() {
    window.helloworld = this
    return h('div', { id: 'root' }, 'hello, ' + this.msg)
  },
  setup() {
    return {
      msg: 'world'
    }
  }
}
export default App
