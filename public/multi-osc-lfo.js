import { toFrequency } from './util.js'
import { initState } from './state.js'
import fuzz from './Guitar_Fuzz.js'

export class Synthie {
  constructor () {
    this.context = new AudioContext()
    this.lfo = this.context.createOscillator()
    this.lfoGain = this.context.createGain()
    this.analyzer = this.context.createAnalyser()
    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById('wave')
    this.canvasCtx = this.canvas.getContext('2d')
    this.state = initState('controls')
    this.playing = {}

    this.lfo.type = 'sine'
    this.lfo.frequency.setValueAtTime(2, 0)
    this.lfo.connect(this.lfoGain.gain)
    this.lfo.start()

    this.lfoGain.connect(this.analyzer)
    this.lfoGain.connect(this.context.destination)

    this.analyzer.fftSize = 2048
    this.canvasCtx.fillStyle = 'rgb(0, 0, 0)'
    this.canvasCtx.strokeStyle = 'rgb(0, 255, 0)'
    this.canvasCtx.lineWidth = 1

    this.draw()
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

  play (key) {
    if (this.playing[key]) {
      this.stop(key)
    }

    const { currentTime } = this.context
    const { attack, oscillators } = this.state
    const sweep = this.context.createGain()

    sweep.gain.setValueAtTime(0, currentTime)
    sweep.gain.linearRampToValueAtTime(1, currentTime + attack)
    sweep.connect(this.lfoGain)

    this.playing[key] = {
      sweep,
      oscillators: oscillators.map(({
        waveform,
        octave
      }) => {
        const osc = this.context.createOscillator()

        osc.type = waveform
        osc.frequency.setValueAtTime(toFrequency(key, octave), currentTime)
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
    const { release } = this.state

    sweep.gain.cancelScheduledValues(currentTime)
    sweep.gain.linearRampToValueAtTime(0, currentTime + release)

    window.setTimeout(() => {
      oscillators.forEach(osc => osc.stop())
    }, release * 1000)

    delete this.playing[key]
  }

  draw () {
    const { width, height } = this.canvas
    const bufferLength = this.analyzer.frequencyBinCount
    const sliceWidth = width / bufferLength
    const dataArray = new Uint8Array(bufferLength)

    this.analyzer.getByteTimeDomainData(dataArray)
    this.canvasCtx.lineWidth = 2
    this.canvasCtx.clearRect(0, 0, width, height)
    this.canvasCtx.fillRect(0, 0, width, height)
    this.canvasCtx.beginPath()

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128
      const x = i * sliceWidth
      const y = v * height / 2

      if (i === 0) {
        this.canvasCtx.moveTo(x, y)
      } else {
        this.canvasCtx.lineTo(x, y)
      }
    }

    this.canvasCtx.stroke()
    window.requestAnimationFrame(() => this.draw())
  }
}
