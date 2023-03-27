import { h } from '../../dist/mini-vue.esm.js'
const Foo = {
    name: 'Foo',
    setup() {
        
    },
    render() {
      console.log(this.$slots)
      const foo = h('p', {}, 'foo')
      return h('div', {}, [this.$slots.header({headerValue:1}), foo, this.$slots.default({defaultValue: 2})])
    }
}
export default Foo