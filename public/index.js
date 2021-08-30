import fuzz from './Guitar_Fuzz.js'

const state = ['attack', 'release'].reduce((result, id) => {
  const control = document.getElementById(id)

  const setState = () => Object.assign(result, {
    [id]: Number(control.value)
  })

  control.addEventListener('input', setState)
  return setState()
}, {})

/**
 * @param {OscillatorNode} oscillator
 * @param {GainNode} sweep
 * @param {number} key
 */
function play (oscillator, sweep, key) {
  const { currentTime } = oscillator.context

  sweep.gain.cancelScheduledValues(currentTime)
  sweep.gain.setTargetAtTime(0, currentTime, 0)
  sweep.gain.linearRampToValueAtTime(1, currentTime + state.attack)

  oscillator.frequency.setTargetAtTime(
    Math.pow(2, (key - 69) / 12) * 440,
    currentTime,
    0
  )
}

function connect (device) {
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const wave = context.createPeriodicWave(fuzz.real, fuzz.imag)
  const sweep = context.createGain()
  let handle = null

  context.suspend()
  oscillator.setPeriodicWave(wave)
  oscillator.connect(sweep).connect(context.destination)
  oscillator.start(0)

  device.addEventListener('midimessage', event => {
    const [command, key, velocity] = event.data
    window.clearTimeout(handle)

    switch (command) {
      case 0x80:
        sweep.gain.linearRampToValueAtTime(0, context.currentTime + state.release)
        handle = window.setTimeout(() => context.suspend(), state.release * 1000)
        return
      case 0x90:
        play(oscillator, sweep, key)
        context.resume()
    }

    console.log(event.data)
  })
}

navigator.requestMIDIAccess().then(access => {
  let button

  for (const [, device] of access.inputs) {
    button = document.createElement('button')
    button.textContent = `${device.manufacturer} ${device.name}`
    button.addEventListener('click', () => connect(device))
    document.body.appendChild(button)
  }

  button.click()
})
