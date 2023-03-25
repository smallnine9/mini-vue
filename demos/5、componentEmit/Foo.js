import { h } from '../../dist/mini-vue.esm.js'
const Foo = {
    name: 'Foo',
    setup(props, { emit }) {
        const emitAdd = () => {
            console.log('emitAdd')
            emit('add', 1),
            emit('add-foo', 1),
            emit('plus', 1,2)
        }
        return {
            emitAdd
        }
    },
    render() {
        const btn = h('button', {onClick: this.emitAdd}, 'emiAdd' )
        const foo = h('p', {}, 'foo')
        return h('div', {}, [btn, foo])
    }
}
export default Foo