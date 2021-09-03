import { parseNumber, hasOwnProperty } from './util.js'

export function initState (containerId) {
  const container = document.getElementById(containerId)
  const controls = Array.from(container.elements)

  return controls.reduce((result, control) => {
    const isMultiControl = control.name.slice(-2) === '[]'
    const key = control.name.replace(/\[\]$/, '')

    if (hasOwnProperty(result, key)) {
      return result
    }

    return Object.defineProperty(result, key, {
      get () {
        if (!isMultiControl) {
          return parseNumber(control.value)
        }

        const controls = container.elements[control.name]

        return Array.from(
          controls instanceof RadioNodeList ? controls : [controls],
          current => parseNumber(current.value)
        )
      }
    })
  }, {})
}
