import { Synthie } from './multi-osc-lfo.js'

const synthie = new Synthie()

function createButton (device) {
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
  document.body.appendChild(button)

  return button
}

navigator.requestMIDIAccess().then(access => {
  let button

  for (const [, device] of access.inputs) {
    button = createButton(device)
  }

  button.click()
})
