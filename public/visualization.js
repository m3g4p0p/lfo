export function initVisualization (canvasId, synthie) {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById(canvasId)
  const canvasCtx = canvas.getContext('2d')
  const { width, height } = canvas
  const bufferLength = synthie.analyzer.frequencyBinCount
  const sliceWidth = width / bufferLength
  const dataArray = new Uint8Array(bufferLength)

  canvasCtx.fillStyle = 'rgb(0, 0, 0)'
  canvasCtx.strokeStyle = 'rgb(0, 255, 0)'
  canvasCtx.lineWidth = 1

  window.requestAnimationFrame(function draw () {
    synthie.analyzer.getByteTimeDomainData(dataArray)
    canvasCtx.lineWidth = 2
    canvasCtx.clearRect(0, 0, width, height)
    canvasCtx.fillRect(0, 0, width, height)
    canvasCtx.beginPath()

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128
      const x = i * sliceWidth
      const y = v * height / 2

      if (i === 0) {
        canvasCtx.moveTo(x, y)
      } else {
        canvasCtx.lineTo(x, y)
      }
    }

    canvasCtx.stroke()
    window.requestAnimationFrame(draw)
  })
}
