import { state, toFrequency } from './util.js'
import fuzz from './Guitar_Fuzz.js'

export class Synthie {
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
    const lfo = this.context.createOscillator()
    const wave = this.context.createPeriodicWave(fuzz.real, fuzz.imag)
    const sweep = this.context.createGain()
    const frequency = toFrequency(key)

    sweep.gain.cancelScheduledValues(currentTime)
    sweep.gain.setTargetAtTime(0, currentTime, 0)
    sweep.gain.linearRampToValueAtTime(1, currentTime + state.attack)
    sweep.connect(this.context.destination)

    oscillator.setPeriodicWave(wave)
    oscillator.frequency.setValueAtTime(frequency, currentTime)
    oscillator.connect(sweep)
    oscillator.start(currentTime)

    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(frequency / 2, currentTime)
    lfo.connect(sweep)
    lfo.start(currentTime)

    this.pressed[key] = { oscillator, lfo, sweep }
  }

  stop (key) {
    if (!this.pressed[key]) {
      return
    }

    const { oscillator, lfo, sweep } = this.pressed[key]
    const { currentTime } = this.context
    const endTime = currentTime + state.release

    oscillator.stop(endTime)
    lfo.stop(endTime)
    sweep.gain.linearRampToValueAtTime(0, endTime)

    window.setTimeout(() => {
      oscillator.disconnect()
      sweep.disconnect()
      lfo.disconnect()
    }, state.release * 1000)

    delete this.pressed[key]
  }
}
