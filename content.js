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

// Check for ?debug or debug=true in the query string to enable debug mode
const debugMode = new URLSearchParams(window.location.search).has('debug')

let logElement = null

if (debugMode) {
  logElement = document.createElement('pre')

  // Display at bottom right of the screen
  logElement.style.display = 'block'
  logElement.style.padding = '1em'
  logElement.style.position = 'fixed'
  logElement.style.bottom = '0'
  logElement.style.right = '0'
  logElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  logElement.style.color = 'white'
  logElement.style.fontFamily = 'monospace'
  logElement.style.zIndex = '999999'
  logElement.style.maxHeight = '10vh'
  logElement.style.overflow = 'auto'
  logElement.style.width = '30vw'
  logElement.style.boxSizing = 'border-box'

  document.body.appendChild(logElement)
}

const log = !debugMode
  ? console.debug
  : (...args) => {
      console.debug(...args)

      logElement.textContent +=
        args
          .map(arg => {
            if (typeof arg === 'string') {
              return arg
            }

            return JSON.stringify(arg, null, 2)
          })
          .join(' ') + '\n'

      // Scroll to the bottom of the log element if the user has not scrolled up
      // Allow a margin of 10px
      const margin = 10
      const scrollBottom = logElement.scrollHeight - logElement.clientHeight
      const scrollPosition = logElement.scrollTop + logElement.clientHeight

      if (scrollBottom - scrollPosition <= margin) {
        logElement.scrollTop = logElement.scrollHeight
      }
    }

log('debug mode enabled')

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
    log('no buttons found')
    return null
  }

  let primaryButton = null
  let tryAgainButton = null
  let wasWrong = false

  for (const button of buttons.children) {
    // Match the try again button
    if (button.textContent?.includes('Prøv igjen')) {
      log('found try again button')
      tryAgainButton = button
    }

    // Match the see solution button. If it exists, the user was wrong.
    if (button.textContent?.includes('Vis fasit')) {
      log('found see solution button')
      wasWrong = true
    }

    // Match the next button (primary button)
    if (button.classList.contains('r4-button--primary')) {
      log('found primary button')
      primaryButton = button
    }
  }

  // If no lesson navigation buttons are found, return null. This is the case
  // when the user has not started typing or making selections yet.
  if (!primaryButton && !tryAgainButton && !wasWrong) {
    log('no buttons found')
    return null
  }

  // If the user was wrong, return the try again button if it exists, otherwise
  // return the primary button
  if (wasWrong) {
    log('user was wrong, returning try again button/primary button')
    return tryAgainButton ?? primaryButton
  }

  // If the user was right, return the primary button if it exists.
  if (primaryButton) {
    log('user was right, returning primary button')
    return primaryButton
  }

  // If there is no primary button, return the next or summary button for the
  // chapter

  const lessonNavButtons = document.querySelectorAll(
    '.r4-lesson-navigation-bottom button'
  )

  for (const button of lessonNavButtons) {
    // If the button is the next or summary button for the chapter, return it
    if (
      button.textContent?.includes('Neste') ||
      button.textContent?.includes('Oppsummering')
    ) {
      log('found next/summary button')

      return button
    }
  }

  log('no primary button found')
  return null
}

const mainContainerObserver = new MutationObserver(() =>
  requestAnimationFrame(applyHooks)
)
const mainContainerObserverConfig = { childList: true, subtree: true }

// Wait for the main container to be added to the app. When it is, start
// observing it.

const waitForMainContainer = () => {
  const mainContainer = getMainContainer()

  if (!mainContainer) {
    setTimeout(waitForMainContainer, 100)

    return
  }

  log('main container found')

  mainContainerObserver.observe(mainContainer, mainContainerObserverConfig)
}

// Check if the current page is a lesson page
if (document.querySelector('script[src*="vgnoa"][src*="runtime"]')) {
  log('lesson page detected')
  waitForMainContainer()

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

  log('init extension')
} else {
  log('not a lesson page')
}

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
      log('focusable is disabled, focusing primary button')
      getPrimaryButton()?.focus?.()

      return
    }

    log(`focusing focusable element: ${focusable.tagName}`, focusable)
    focusable.focus()
  }
}
