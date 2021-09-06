import { toFrequency } from './util.js'
import fuzz from './Guitar_Fuzz.js'

export class Synthie {
  constructor (settings) {
    this.context = new AudioContext()
    this.lfo = this.context.createOscillator()
    this.lfoGain = this.context.createGain()
    this.analyzer = this.context.createAnalyser()
    this.compressor = this.context.createDynamicsCompressor()
    this.settings = settings
    this.playing = {}

    this.lfo.type = 'sine'
    this.lfo.frequency.setValueAtTime(2, 0)
    this.lfo.connect(this.lfoGain.gain)
    this.lfo.start()

    this.compressor.connect(this.context.destination)
    this.compressor.connect(this.analyzer)

    this.analyzer.fftSize = 2048
  }

  connect (device) {
    device.addEventListener('midimessage', this)
  }

  disconnect (device) {
    device.removeEventListener('midimessage', this)
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

  connectSource (source) {
    const { frequency, lfoWaveform } = this.settings.get('lfo')
    const { threshold, knee } = this.settings.get('compressor')
    const { currentTime } = this.context
    const useLfo = frequency > 0

    if (useLfo) {
      source.connect(this.lfoGain)
    } else {
      source.connect(this.compressor)
    }

    if (
      this.lfo.type !== lfoWaveform ||
      this.lfo.frequency.value !== frequency
    ) {
      if (useLfo) {
        this.lfo.type = lfoWaveform
        this.lfo.frequency.setValueAtTime(frequency, currentTime)
        this.lfoGain.connect(this.compressor)
      } else {
        this.lfoGain.disconnect()
      }
    }

    if (
      this.compressor.threshold.value !== threshold ||
      this.compressor.knee.value !== knee
    ) {
      this.compressor.threshold.setValueAtTime(threshold, currentTime)
      this.compressor.knee.setValueAtTime(knee, currentTime)
    }
  }

  play (key) {
    if (this.playing[key]) {
      this.stop(key)
    }

    const { currentTime } = this.context
    const { attack, oscillators } = this.settings.get()
    const sweep = this.context.createGain()

    sweep.gain.setValueAtTime(0, currentTime)
    sweep.gain.linearRampToValueAtTime(1, currentTime + attack)
    this.connectSource(sweep)

    this.playing[key] = {
      sweep,
      oscillators: oscillators.map(({
        waveform,
        octave,
        pitch
      }) => {
        const osc = this.context.createOscillator()
        const frequency = toFrequency(key + pitch, octave)

        osc.type = waveform
        osc.frequency.setValueAtTime(frequency, currentTime)
        osc.connect(sweep)
        osc.start()

        return osc
      })
    }
  }

  stop (key) {
    if (!this.playing[key]) {
      return
    }

    const { currentTime } = this.context
    const { oscillators, sweep } = this.playing[key]
    const { release } = this.settings.get()

    sweep.gain.cancelScheduledValues(currentTime)
    sweep.gain.linearRampToValueAtTime(0, currentTime + release)

    window.setTimeout(() => {
      oscillators.forEach(osc => osc.stop())
      sweep.disconnect()
    }, release * 1000)

    delete this.playing[key]
  }
}
