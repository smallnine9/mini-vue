import { h } from '../../dist/mini-vue.esm.js'
const Foo = {
    name: 'Foo',
    setup(props) {
        // props.count
        console.log(props)
        // props can't be changed
        props.count++
        console.log(props)
    },
    render() {
        return h ('div', {}, 'foo' + this.count)
    }
}
export default Foo