import { h, createTextVnode, provide } from '../../dist/mini-vue.esm.js'
import Child from './Child.js'
const App = {
  name: 'App',
  render() {
    return h(
      'div',
      {
        id: 'App'
      },
      [h(Child)]
    )
  },
  setup() {
    provide('App', 'hellworld')
    return {
      msg: 'world'
    }
  }
}
export default App
