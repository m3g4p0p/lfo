import { state, toFrequency } from './util.js'
import fuzz from './Guitar_Fuzz.js'

export class Synthie {
  constructor () {
    this.context = new AudioContext()
    this.osc = this.context.createOscillator()
    this.lfo = this.context.createOscillator()
    this.lfoGain = this.context.createGain()
    this.sweep = this.context.createGain()
    this.key = null

    this.osc.type = 'sine'
    this.osc.start()

    this.sweep.gain.setValueAtTime(0, 0)

    this.lfo.type = 'sawtooth'
    this.lfo.frequency.setValueAtTime(2, 0)
    this.lfo.connect(this.lfoGain.gain)
    this.lfo.start()

    this.osc
      .connect(this.sweep)
      .connect(this.lfoGain)
      .connect(this.context.destination)
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
    const { currentTime } = this.context

    this.key = key
    this.sweep.gain.cancelScheduledValues(currentTime)
    this.sweep.gain.setValueAtTime(0, currentTime)
    this.sweep.gain.linearRampToValueAtTime(1, currentTime + state.attack)
    this.osc.frequency.setValueAtTime(toFrequency(key), currentTime)
  }

  stop (key) {
    if (key !== this.key) {
      return
    }

    const { currentTime } = this.context
    this.sweep.gain.linearRampToValueAtTime(0, currentTime + state.release)
  }
}
