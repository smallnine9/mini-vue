import { createRenderer } from '../../runtime-core/src/index'
function patchProp(el: any, key, prevVal, nextVal) {
  const isOn = /^on[A-Z]/.test(key)
  if (isOn) {
    const func = nextVal
    el.addEventListener(key.slice(2).toLocaleLowerCase(), func)
  } else {
    if(nextVal === undefined || nextVal === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextVal)
    }
  }
}

function createElement(type: any) {
  return document.createElement(type)
}

function insert(
  el,
  container,
  anchor
) {
  container.insertBefore(el, anchor)
}

function setElementText(el, text) {
  el.textContent = text
}

function remove(el) {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
}

const options = {
  createElement,
  patchProp,
  insert,
  setElementText,
  remove
}

// 暴露给用户的接口
export function createApp(...args) {
  return createRenderer(options).createApp(...args)
}