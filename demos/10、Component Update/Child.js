import { h } from "../../dist/mini-vue.esm.js"

export default {
  name: 'Child',
  setup(props) {

  },
  render() {
    return h('p', {}, 'child props is ' + this.$props.msg)
  }
}