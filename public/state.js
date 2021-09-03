import { parseNumber, hasOwnProperty, isMulti } from './util.js'

function getControlState (control) {
  if (control instanceof HTMLFieldSetElement) {
    return initState(control, false)
  }

  return parseNumber(control.value)
}

export function initState (containerId, allowMulti = true) {
  const container = typeof containerId === 'string'
    ? document.getElementById(containerId)
    : containerId

  return Array.from(container.elements).reduce((result, control) => {
    const isMultiControl = allowMulti && isMulti(control)
    const key = control.name.replace(/\[\]$/, '')

    if (hasOwnProperty(result, key)) {
      return result
    }

    return Object.defineProperty(result, key, {
      get () {
        if (!isMultiControl) {
          return getControlState(control)
        }

        const controls = container.elements[control.name]

        return Array.from(
          controls instanceof RadioNodeList ? controls : [controls],
          current => getControlState(current)
        )
      }
    })
  }, {})
}
