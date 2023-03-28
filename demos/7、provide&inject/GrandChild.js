import { inject, h } from "../../dist/mini-vue.esm.js"
export default {
    name: 'GrandChild',
    setup() {
        const value = inject('App')
        const defaultinject = inject('default', 123)
        return {
            AppValue: value,
            defaultinject
        }
    },
    render() {
        return h('p', {}, 'grandchild' + this.AppValue + 'defaultinject:' + this.defaultinject)
    }

}