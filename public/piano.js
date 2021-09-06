import { handleEvents } from './util.js'

export function initPiano (pianoId, synthie) {
  const keys = document
    .getElementById(pianoId)
    .querySelectorAll('button')

  handleEvents(keys, 'mousedown mouseenter', ({ target, buttons }) => {
    if (buttons === 1) {
      synthie.play(Number(target.value))
    }
  })

  handleEvents(keys, 'mouseup mouseleave', ({ target }) => {
    synthie.stop(Number(target.value))
  })

  window.requestAnimationFrame(function togglePressed () {
    const pressed = Object.keys(synthie.playing).map(key => key % 12)

    keys.forEach((key, index) => {
      key.classList.toggle('pressed', pressed.includes(index))
    })

    window.requestAnimationFrame(togglePressed)
  })
}
