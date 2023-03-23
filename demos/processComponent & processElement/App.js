import { h } from '../../dist/mini-vue.esm.js'
const App = {
  name: 'HelloWorld',
  setup() {},
  render() {
    return h('div', { id: 'root' }, 
    [h('div', {class: 'red'}, "I'm red"),
     h('div', { class: 'green'}, "I'm green")
    ])
  }
}
export default App
