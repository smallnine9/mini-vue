export const extend = Object.assign

export const isObject = (res) => {
  return res !== null && typeof res === 'object'
}

export const hasChanged = (value, oldValue) => {
  return !Object.is(value, oldValue)
}


export const hasKey = (val, key) => Object.prototype.hasOwnProperty.call(val, key)