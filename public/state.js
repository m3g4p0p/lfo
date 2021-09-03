import { parseNumber } from './util.js'

export function initState (containerId) {
  const container = document.getElementById(containerId)
  const controls = Array.from(container.elements)

  return controls.reduce((result, control) => {
    return Object.defineProperty(result, control.id, {
      get () {
        return parseNumber(control.value)
      }
    })
  }, {})
}
