function parseNumber (value) {
  const number = Number(value)
  return Number.isNaN(number) ? value : number
}

export const state = Array.from(
  document.querySelectorAll('.control input, .control select')
).reduce((result, control) => {
  const setState = () => Object.assign(result, {
    [control.id]: parseNumber(control.value)
  })

  control.addEventListener('input', setState)
  return setState()
}, {})

export function toFrequency (key) {
  return Math.pow(2, (key - 69) / 12) * 440
}
