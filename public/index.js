import fuzz from './Guitar_Fuzz.js'

const state = ['attack', 'release'].reduce((result, id) => {
  const control = document.getElementById(id)

  const setState = () => Object.assign(result, {
    [id]: Number(control.value)
  })

  control.addEventListener('input', setState)
  return setState()
}, {})

function connect (device) {
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const wave = context.createPeriodicWave(fuzz.real, fuzz.imag)
  const sweep = context.createGain()
  let isStarted = false

  oscillator.setPeriodicWave(wave)
  oscillator.connect(sweep).connect(context.destination)

  device.addEventListener('midimessage', event => {
    const [command, key, velocity] = event.data

    switch (command) {
      case 0x80:
        return context.suspend()
      case 0x90:
        sweep.gain.cancelScheduledValues(context.currentTime)
        sweep.gain.setTargetAtTime(0, context.currentTime, 0)
        sweep.gain.linearRampToValueAtTime(1, context.currentTime + state.attack)

        oscillator.frequency.setTargetAtTime(
          Math.pow(2, (key - 69) / 12) * 440,
          context.currentTime, 0
        )

        if (isStarted) {
          context.resume()
        } else {
          oscillator.start(0)
          isStarted = true
        }
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
