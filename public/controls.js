function getRemoveActions (container) {
  return document.querySelectorAll(
    `[name="${container.name}"] [data-action="remove"]`
  )
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
      current.hidden = false
    })
  },

  /**
   * @param {HTMLAnchorElement} target
   */
  remove (target) {
    const container = target.closest('fieldset')

    container.parentElement.removeChild(container)

    getRemoveActions(container).forEach((current, index, all) => {
      current.hidden = all.length === 1
    })
  }
}

export function initControls (containerId, state) {
  const container = document.getElementById(containerId)

  container.addEventListener('click', event => {
    const { target } = event
    const { action } = target.dataset

    if (action) {
      actions[action](target)
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
