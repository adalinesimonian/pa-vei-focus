// På Vei - Input Focus Improvements
// Copyright © 2022 Adaline Valentina Simonian
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

const getMainContainer = () => document.querySelector('app-main-app main')

const getLessonElement = () =>
  document.evaluate(
    '//*[contains(@class, "oppgavesamling-main")]/*[starts-with(local-name(), "app-")]',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue

const getFirstFocusable = () =>
  document
    .querySelector('.r4-exercise__task')
    ?.querySelector(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    )

const getPrimaryButton = () => {
  const buttons = document.querySelector('.r4-exercise-footer__buttons')

  if (!buttons) {
    return null
  }

  let primaryButton = null
  let tryAgainButton = null
  let wasWrong = false

  for (const button of buttons.children) {
    if (button.textContent?.includes('Prøv igjen')) {
      tryAgainButton = button
    }

    if (button.textContent?.includes('Vis fasit')) {
      wasWrong = true
    }

    if (button.classList.contains('r4-button--primary')) {
      primaryButton = button
    }
  }

  if (wasWrong) {
    return tryAgainButton ?? primaryButton
  }

  if (primaryButton) {
    return primaryButton
  }

  const lessonNavButtons = document.querySelectorAll(
    '.r4-lesson-navigation-bottom button'
  )

  for (const button of lessonNavButtons) {
    if (
      button.textContent?.includes('Neste') ||
      button.textContent?.includes('Oppsummering')
    ) {
      return button
    }
  }

  return null
}

const mainContainerObserver = new MutationObserver(applyHooks)
const mainContainerObserverConfig = { childList: true, subtree: true }

// Wait for the main container to be added to the app. When it is, start
// observing it.

const waitForMainContainer = () => {
  const mainContainer = getMainContainer()

  if (!mainContainer) {
    setTimeout(waitForMainContainer, 100)

    return
  }

  mainContainerObserver.observe(mainContainer, mainContainerObserverConfig)
}

waitForMainContainer()

let lastLesson = null
let lastFocusable = null
let lastDisabled = null

function applyHooks() {
  const lesson = getLessonElement()

  if (!lesson) {
    return
  }

  // console.debug('applyHooks')
  // console.debug('lessonElement', lesson)

  if (lastLesson !== lesson) {
    lastLesson = lesson

    // console.debug('new lesson')
  }

  const focusable = getFirstFocusable()

  if (
    focusable &&
    (lastFocusable !== focusable || lastDisabled !== focusable.disabled)
  ) {
    lastFocusable = focusable
    lastDisabled = focusable.disabled

    // console.debug('focusable', focusable)

    // If the element is disabled, focus the primary button instead
    if (focusable.disabled) {
      getPrimaryButton()?.focus?.()

      return
    }

    focusable.focus()
  }
}

// Add event listener for the enter key to click the primary button
document.addEventListener('keydown', e => {
  // Don't run if a button or a link is focused
  if (
    document.activeElement?.tagName === 'BUTTON' ||
    (document.activeElement?.tagName === 'A' && document.activeElement?.href)
  ) {
    return
  }

  if (e.key === 'Enter') {
    getPrimaryButton()?.click?.()
  }
})

console.debug('init extension')
