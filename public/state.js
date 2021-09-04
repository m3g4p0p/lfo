import { parseNumber, hasOwnProperty, isMulti, normalizeName } from './util.js'

function getControlState (control) {
  if (control instanceof HTMLFieldSetElement) {
    return createState(control, false)
  }

  if (control.type === 'checkbox') {
    return control.checked
  }

  return parseNumber(control.value)
}

function getMultiState (container, control) {
  const controls = container.elements[control.name]

  return Array.from(
    controls instanceof RadioNodeList ? controls : [controls],
    current => getControlState(current)
  )
}

function createState (container, allowMulti = true) {
  return Array.from(container.elements).reduce((result, control) => {
    const key = normalizeName(control)

    if (hasOwnProperty(result, key)) {
      return result
    }

    const value = allowMulti && isMulti(control)
      ? getMultiState(container, control)
      : getControlState(control)

    return Object.defineProperty(result, key, { value })
  }, {})
}

export class State {
  constructor (containerId) {
    this.container = document.getElementById(containerId)
    this.update()
  }

  update () {
    this._state = createState(this.container)
  }

  get (key) {
    return key ? this._state[key] : this._state
  }
}
