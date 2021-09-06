function getRemoveActions (container) {
  return document.querySelectorAll(
    `[name="${container.name}"] [data-action="remove"]`
  )
}

function updateOutput (control) {
  const output = control.nextElementSibling

  if (output) {
    output.value = control.value
  }
}

const actions = {
  /**
   * @param {HTMLAnchorElement} target
   */
  clone (target) {
    const container = target.closest('fieldset')

    container.parentElement.insertBefore(
      container.cloneNode(true),
      container.nextElementSibling
    )

    getRemoveActions(container).forEach(current => {
      current.disabled = false
    })
  },

  /**
   * @param {HTMLAnchorElement} target
   */
  remove (target) {
    const container = target.closest('fieldset')

    container.parentElement.removeChild(container)

    getRemoveActions(container).forEach((current, index, all) => {
      current.disabled = all.length === 1
    })
  }
}

export function initControls (containerId, settings) {
  const container = document.getElementById(containerId)

  container.addEventListener('click', event => {
    const { target } = event
    const { action } = target.dataset

    if (action) {
      actions[action](target)
      settings.update()
    }
  })

  container.addEventListener('input', event => {
    updateOutput(event.target)
    settings.update()
  })

  container.querySelectorAll('input').forEach(control => {
    updateOutput(control)
  })
}
