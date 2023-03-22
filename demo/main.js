import App from './App.js'
import { createApp } from '../dist/mini-vue.esm.js'

const rootContainer = document.getElementById('root')
createApp(App).mount(rootContainer)