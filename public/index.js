import { Synthie } from './multi-osc-lfo.js'

const synthie = new Synthie()

function createButton (device) {
  const container = document.getElementById('devices')
  const button = document.createElement('button')
  let isActive = false

  button.addEventListener('click', () => {
    button.classList.toggle('active', isActive = !isActive)

    if (isActive) {
      return synthie.connect(device)
    }

    synthie.disconnect(device)
  })

  button.textContent = `${device.manufacturer} ${device.name}`
  container.appendChild(button)

  return button
}

/**
 * @param {HTMLAnchorElement} element
 */
function cloneControl (element) {
  const constainer = element.closest('.removable')

  constainer.parentElement.insertBefore(
    constainer.cloneNode(true),
    constainer.nextElementSibling
  )
}

/**
 * @param {HTMLAnchorElement} element
 */
function removeControl (element) {
  element.closest('.removable').remove()
}

navigator.requestMIDIAccess().then(access => {
  let button

  for (const [, device] of access.inputs) {
    button = createButton(device)
  }

  button.click()
})

document.body.addEventListener('click', event => {
  const { target } = event

  if (target.classList.contains('add')) {
    event.preventDefault()
    cloneControl(target)
  }

  if (target.classList.contains('remove')) {
    event.preventDefault()
    removeControl(target)
  }
})
