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
  const container = element.closest('.control-container')

  container.parentElement.insertBefore(
    container.cloneNode(true),
    container.nextElementSibling
  )

  document
    .querySelectorAll(`[data-id="${container.dataset.id}"] .remove`)
    .forEach(current => {
      current.hidden = false
    })
}

/**
 * @param {HTMLAnchorElement} element
 */
function removeControl (element) {
  const container = element.closest('.control-container')

  container.parentElement.removeChild(container)

  document
    .querySelectorAll(`[data-id="${container.dataset.id}"] .remove`)
    .forEach((current, index, all) => {
      current.hidden = all.length === 1
    })
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
