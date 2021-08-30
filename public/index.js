import fuzz from './Guitar_Fuzz.js'

const state = ['attack', 'release'].reduce((result, id) => {
  const control = document.getElementById(id)

  const setState = () => Object.assign(result, {
    [id]: Number(control.value)
  })

  control.addEventListener('input', setState)
  return setState()
}, {})

function toFrequency (key) {
  return Math.pow(2, (key - 69) / 12) * 440
}

class Synthie {
  constructor () {
    this.context = new AudioContext()
    this.pressed = {}
  }

  connect (device) {
    device.addEventListener('midimessage', this)
  }

  handleEvent (event) {
    const [command, key, velocity] = event.data

    switch (command) {
      case 0x80:
        return this.stop(key)
      case 0x90:
        return this.play(key)
    }
  }

  play (key) {
    if (this.pressed[key]) {
      this.stop(key)
    }

    const { currentTime } = this.context
    const oscillator = this.context.createOscillator()
    const wave = this.context.createPeriodicWave(fuzz.real, fuzz.imag)
    const sweep = this.context.createGain()

    sweep.gain.cancelScheduledValues(currentTime)
    sweep.gain.setTargetAtTime(0, currentTime, 0)
    sweep.gain.linearRampToValueAtTime(1, currentTime + state.attack)
    oscillator.setPeriodicWave(wave)
    oscillator.connect(sweep).connect(this.context.destination)
    oscillator.frequency.setTargetAtTime(toFrequency(key), currentTime, 0)
    oscillator.start(currentTime)

    this.pressed[key] = { oscillator, sweep }
  }

  stop (key) {
    if (!this.pressed[key]) {
      return
    }

    const { oscillator, sweep } = this.pressed[key]
    const { currentTime } = this.context
    const endTime = currentTime + state.release

    oscillator.stop(endTime)
    sweep.gain.linearRampToValueAtTime(0, endTime)
    window.setTimeout(() => oscillator.disconnect(), state.release * 1000)

    delete this.pressed[key]
  }
}

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
