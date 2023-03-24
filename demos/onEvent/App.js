import { h } from '../../dist/mini-vue.esm.js'
const App = {
  name: 'HelloWorld',
  setup() {},
  render() {
    return h('button', { onClick: () => { alert('clicked') } }, 
    'click me'
    )
  }
}
export default App
