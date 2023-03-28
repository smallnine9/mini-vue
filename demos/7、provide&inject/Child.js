import { h, inject } from '../../dist/mini-vue.esm.js'
import GrandChild from './GrandChild.js'
const Child = {
    name: 'Child',
    setup() {
       const value = inject('App') 
       return {
        AppValue: value
       }
    },
    render() {
      return h('div', {}, [h(GrandChild)])
    }
}
export default Child