import { ref, h } from "../../dist/mini-vue.esm.js";
import Child from './Child.js'
export default {
  name: "App",
  setup() {
    let count = ref(1)
    let msg = ref('hello')
    const changeMsg = () => {
      msg.value = 'world'
    }
    const changeCount = () => {
      count.value++
    }
    window.msg = msg
    window.count = count
    return {
      count,
      msg,
      changeMsg,
      changeCount
    }
  },
  render() {
    return h('div', {}, [
      h('button', {
        onClick: this.changeMsg
      }, 'change msg'),
      h(Child,{
        msg: this.msg
      }),
      h('button', {
        onClick: this.changeCount
      }, 'changeCount'),
      h('p', {
      }, this.count)
    ])
  }
}