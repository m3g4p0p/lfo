export function parseNumber (value) {
  const number = Number(value)
  return Number.isNaN(number) ? value : number
}

export function toFrequency (key, octave = 1) {
  return Math.pow(2, (key - 69) / 12) * 440 * Math.pow(2, octave)
}

export function hasOwnProperty (object, name) {
  return Object.prototype.hasOwnProperty.call(object, name)
}

export function isMulti (control) {
  return control.name.slice(-2) === '[]'
}
