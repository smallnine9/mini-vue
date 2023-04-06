import { h, ref, nextTick } from '../../dist/mini-vue.esm.js'
const App = {
  name: 'App',
  setup() {
    const count = ref(0)
    async function onClick () {
      for (let i = 0; i < 100; i++) {
        console.log("update");
        count.value = i;
      }
      debugger;
      console.log(document.getElementById('btn').textContent);
      nextTick(() => {
        console.log(document.getElementById('btn').textContent);
      });
    }
    return {
      count,
      onClick
    }
  },
  render() {
    return h('button',{
      onClick: this.onClick,
      id: 'btn'
    }, this.count)
  }
}
export default App
