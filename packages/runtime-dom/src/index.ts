import { createRenderer } from '../../runtime-core/src/index'
function patchProp(el: any, props: any) {
  for (let key in props) {
    const isOn = /^on[A-Z]/.test(key)
    if (isOn) {
      const func = props[key]
      el.addEventListener(key.slice(2).toLocaleLowerCase(), func)
    } else {
      el.setAttribute(key, props[key])
    }
  }
}

function createElement(type: any) {
  return document.createElement(type)
}

function insert(el, container) {
  container.appendChild(el)
}

const options = {
  createElement,
  patchProp,
  insert
}

// 暴露给用户的接口
export function createApp(...args) {
  return createRenderer(options).createApp(...args)
}