# På Vei - Input Focus Improvements

This is a small extension that improves the input focus behaviour in lessons on the [På Vei](https://pavei.cappelendamm.no/) website and other Cappelen Damm courses (such as [Stein på Stein](https://steinpastein.cappelendamm.no/) and [Her på Berget](https://herpaberget.cappelendamm.no/)).

## Improvements

- When opening a lesson, the input focus is set to the first input field.
- Pressing the `Enter` key in a lesson is the same as clicking the `Neste` button, unless a button is focused.
- When a lesson is completed, the `Prøv igjen` button is focused if the lesson is failed, and the `Neste` button is focused if the lesson is passed.
  - If the `Prøv igjen` button is pressed, the input focus is set to the first input field.
  - If the `Neste` button is pressed, the input focus is set to the first input field in the next lesson.
  - If the lesson is the last lesson in the chapter, the input focus is set to the `Neste` or `Oppsummering` button in the chapter navigation.
