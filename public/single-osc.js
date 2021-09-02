import { state, toFrequency } from './util.js'
import fuzz from './Guitar_Fuzz.js'

export class Synthie {
  constructor () {
    this.context = new AudioContext()
    this.osc = this.context.createOscillator()
    this.lfo = this.context.createOscillator()
    this.lfoGain = this.context.createGain()
    this.sweep = this.context.createGain()
    this.analyzer = this.context.createAnalyser()
    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById('wave')
    this.canvasCtx = this.canvas.getContext('2d')
    this.key = null

    this.osc.type = 'sine'
    this.osc.connect(this.lfoGain)
    this.osc.start()

    this.lfo.type = 'sawtooth'
    this.lfo.frequency.setValueAtTime(2, 0)
    this.lfo.connect(this.lfoGain.gain)
    this.lfo.start()

    this.lfoGain.connect(this.sweep)
    this.sweep.gain.setValueAtTime(0, 0)
    this.sweep.connect(this.analyzer)
    this.sweep.connect(this.context.destination)

    this.analyzer.fftSize = 2048
    this.canvasCtx.fillStyle = 'rgb(0, 0, 0)'
    this.canvasCtx.strokeStyle = 'rgb(0, 255, 0)'
    this.canvasCtx.lineWidth = 1

    this.draw()
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
