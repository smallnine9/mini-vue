export const extend = Object.assign

export const isObject = (res) => {
  return res !== null && typeof res === 'object'
}

export const hasChanged = (value, oldValue) => {
  return !Object.is(value, oldValue)
}


export const hasKey = (val, key) => Object.prototype.hasOwnProperty.call(val, key)

const camelizeRE = /-(\w)/g

export const camelize = (str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
}

export const capitalize = (str) => {
  return str[0].toUpperCase() + str.slice(1)
}

export const toHandlerKey = (str) => {
  return str ? `on${capitalize(str)}` : ``
}

export const isString = (value) => {
  return typeof value === 'string'
}

export { toDisplayString } from './toDisplayString'