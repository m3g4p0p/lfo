import { Synthie } from './single-osc.js'

navigator.requestMIDIAccess().then(access => {
  let button

  for (const [, device] of access.inputs) {
    button = document.createElement('button')
    button.textContent = `${device.manufacturer} ${device.name}`
    button.addEventListener('click', () => new Synthie().connect(device))
    document.body.appendChild(button)
  }

  button.click()
})
