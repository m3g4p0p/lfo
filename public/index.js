import { initControls } from './controls.js'
import { initPiano } from './piano.js'
import { initRecorder } from './recorder.js'
import { initVisualization } from './visualization.js'
import { Synthie } from './multi-osc-lfo.js'
import { State } from './state.js'

const settings = new State('controls')
const synthie = new Synthie(settings)

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

navigator.requestMIDIAccess().then(access => {
  let button

  for (const [, device] of access.inputs) {
    button = createButton(device)
  }

  button.click()
})

initControls('controls', settings)
initPiano('piano', synthie)
initVisualization('wave', synthie)
initRecorder(synthie)
