import { h } from '../../dist/mini-vue.esm.js'
//import ArraytoText from './ArraytoText.js'
import TextToArray from './TextToArray.js'
const App = {
  name: 'App',
  setup() {
  },
  render() {
    return h('div', {tId: 1}, [h(TextToArray)])
  }
}
export default App
