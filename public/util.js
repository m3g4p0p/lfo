export const state = ['attack', 'release'].reduce((result, id) => {
  const control = document.getElementById(id)

  const setState = () => Object.assign(result, {
    [id]: Number(control.value)
  })

  control.addEventListener('input', setState)
  return setState()
}, {})

export function toFrequency (key) {
  return Math.pow(2, (key - 69) / 12) * 440
}
