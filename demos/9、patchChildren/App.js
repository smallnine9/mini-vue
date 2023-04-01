import { h } from '../../dist/mini-vue.esm.js'
//import ArraytoText from './ArraytoText.js'
import TextToArray from './TextToArray.js'
import ArraytoArray from './ArraytoArray.js'
const App = {
  name: 'App',
  setup() {
  },
  render() {
    return h('div', {tId: 1}, [h(ArraytoArray)])
  }
}
export default App
