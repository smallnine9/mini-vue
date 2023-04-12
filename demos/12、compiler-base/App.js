import { ref } from '../../dist/mini-vue.esm.js'
const App = {
  name: 'App',
  setup() {
    const count = ref(0)
    window.count = count
    return {
      count,
    }
  },
  template: `<div>hi, {{count}}</div>`
}
export default App
