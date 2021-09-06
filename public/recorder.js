const THRESHOLD = 100

/**
 * @param {import('./multi-osc-lfo').Synthie} synthie
 */
export function initRecorder (synthie) {
  const destination = synthie.context.createMediaStreamDestination()
  const recorder = new MediaRecorder(destination.stream)
  const reader = new FileReader()
  const chunks = []
  let started = null
  let source = null

  synthie.compressor.connect(destination)

  window.addEventListener('keydown', ({ shiftKey }) => {
    if (!shiftKey || started) {
      return
    }

    started = Date.now()
    recorder.start()

    if (source) {
      source.disconnect()
      source.stop()
      source = null
    }
  })

  window.addEventListener('keyup', ({ shiftKey }) => {
    if (!shiftKey && started) {
      recorder.stop()
    }
  })

  recorder.addEventListener('dataavailable', event => {
    chunks.push(event.data)
  })

  recorder.addEventListener('stop', () => {
    const parts = chunks.splice(0)

    if (Date.now() > started + THRESHOLD) {
      const blob = new Blob(parts, {
        type: 'audio/ogg; codecs=opus'
      })

      reader.readAsArrayBuffer(blob)
    }

    started = null
  })

  reader.addEventListener('loadend', () => {
    synthie.context.decodeAudioData(reader.result, buffer => {
      source = synthie.context.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(synthie.context.destination)
      source.start()
    }, console.error)
  })
}
