let incId = 0

function updateId (id) {
  return id.replace(/-\d+$/, '-' + incId)
}

/**
 * @param {HTMLAnchorElement} target
 */
function cloneControl (target) {
  const container = target.closest('fieldset')
  const clone = container.cloneNode(true)

  incId++

  clone.querySelectorAll('[id]').forEach(element => {
    element.id = updateId(element.id)
  })

  clone.querySelectorAll('[for]').forEach(element => {
    element.setAttribute('for', updateId(element.htmlFor))
  })

  container.parentElement.insertBefore(
    clone,
    container.nextElementSibling
  )

  document
    .querySelectorAll(`[name="${container.name}"] .remove`)
    .forEach(current => {
      current.hidden = false
    })
}

/**
 * @param {HTMLAnchorElement} target
 */
function removeControl (target) {
  const container = target.closest('fieldset')

  container.parentElement.removeChild(container)

  document
    .querySelectorAll(`[name="${container.name}"] .remove`)
    .forEach((current, index, all) => {
      current.hidden = all.length === 1
    })
}

export function initControls (containerId, state) {
  const container = document.getElementById(containerId)

  container.addEventListener('click', event => {
    const { target } = event

    if (target.classList.contains('add')) {
      cloneControl(target)
      state.update()
    }

    if (target.classList.contains('remove')) {
      removeControl(target)
      state.update()
    }
  })

  container.addEventListener('input', event => {
    const output = event.target.nextElementSibling

    if (output) {
      output.value = event.target.value
    }

    state.update()
  })
}
