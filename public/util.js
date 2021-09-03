export function parseNumber (value) {
  const number = Number(value)
  return Number.isNaN(number) ? value : number
}

export function toFrequency (key) {
  return Math.pow(2, (key - 69) / 12) * 440
}

export function hasOwnProperty (object, name) {
  return Object.prototype.hasOwnProperty.call(object, name)
}
