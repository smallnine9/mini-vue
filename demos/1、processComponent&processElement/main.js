import App from './App.js'
import { createApp } from '../../dist/mini-vue.esm.js'

const rootContainer = document.getElementById('root')
console.log(rootContainer)
debugger
createApp(App).mount(rootContainer)