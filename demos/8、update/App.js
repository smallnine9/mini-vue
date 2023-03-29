import { h, ref } from '../../dist/mini-vue.esm.js'
const App = {
  name: 'App',
  setup() {
    const count = ref(0)
    const props = ref({val: 1})
    const onClick = () => {
      count.value++
    }
    const changeProp = () => {
      props.value.val = 2
    }
    const undefineProp = () => {
      props.value.val = undefined
    }
    const sameProp = () => {
      props.value.val = props.value.val
    }
    return {
      count,
      props,
      changeProp,
      undefineProp,
      sameProp,
      onClick
    }
  },
  render() {
    const changeProp = h('button', {onClick: this.changeProp, val: this.props.val}, 'change prop')
    const undefineProp = h('button', {onClick: this.undefineProp, val: this.props.val}, 'undefine prop')
    const sameProp = h('button', {onClick: this.sameProp, val: this.props.val}, 'same prop')
    return h('div', {...this.props}, [changeProp, undefineProp, sameProp])
  }
}
export default App
