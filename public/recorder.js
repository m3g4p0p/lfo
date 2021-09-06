export class Recorder {
  constructor (synthie, settings) {
    /**
     * @type {import('./multi-osc-lfo').Synthie}
     */
    this.synthie = synthie
    this.settings = settings
    this.isRecording = false
    this.startTime = null
    this.endTime = null
    this.frames = []
  }

  init () {
    window.addEventListener('keydown', ({ shiftKey }) => {
      if (shiftKey) {
        this.startRecording()
      }
    })

    window.addEventListener('keyup', ({ shiftKey }) => {
      if (!shiftKey) {
        this.stopRecording()
      }
    })

    this.synthie.subscribe(this)
  }

  startRecording () {
    this.isRecording = true
    this.frames = []
    this.startTime = this.synthie.currentTime
  }

  stopRecording () {
    this.isRecording = false
    this.endTime = this.synthie.currentTime
    this.startPlayback()
  }

  startPlayback () {
    const deltaTime = this.startTime - this.synthie.currentTime
    const queue = this.frames.slice().reverse()
    let current = queue.pop()

    if (!current) {
      return
    }

    const handle = window.setInterval(() => {
      const { currentTime } = this.synthie

      console.log(current.time - currentTime - deltaTime)
      if (current && (current.time >= currentTime + deltaTime)) {
        this.synthie.handleMessage(current.data, current.settings)
        current = queue.pop()
      }

      if (!current) {
        window.clearInterval(handle)
        this.startPlayback()
      }
    })
  }

  handleEvent (event) {
    if (!this.isRecording) {
      return
    }

    this.frames.push({
      data: event.data,
      settings: this.settings.clone(),
      time: this.synthie.currentTime
    })
  }
}

/**
 * @param {import('./multi-osc-lfo').Synthie} synthie
 */
export function initRecorder (synthie) {

}
