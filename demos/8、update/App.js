import { h, ref } from '../../dist/mini-vue.esm.js'
const App = {
  name: 'App',
  setup() {
    const count = ref(0)
    const onClick = () => {
      count.value++
    }
    return {
      count,
      onClick
    }
  },
  render() {
    return h('button', {onClick: this.onClick}, 'count:' + this.count)
  }
}
export default App
