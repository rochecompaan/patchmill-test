# Validation and First Use Implementation Plan

> **For agentic workers:** Use the installed `executing-plans` sibling skill for inline execution in the provided worktree. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Explain incomplete poll input and show first-time users how to create a lunch poll.

**Architecture:** Keep form feedback and row controls in `src/main.ts`. Use `createPoll` for question and count validation. Show the saved view only if the model succeeds and no visible blank row remains.

**Tech Stack:** HTML, CSS, vanilla TypeScript, Vite, Node test runner.

**Spec:** [Issue #7 design](../specs/2026-11-23-issue-7-add-validation-empty-states-and-error-states-design.md).

## Plan inputs

- Read the spec and its inline visual explanation.
- Read the [full-page mockup](../mockups/2026-11-23-validation-empty-states.html) for placement and focus intent. The spec and existing product behavior take priority over mockup code.
- Read the [Issue #3 design](../specs/2026-11-23-issue-3-build-the-create-poll-form-design.md) for the current form contract. Issue #7 changes blank-row handling only at the browser boundary.

## Global constraints

- Use Node.js 24, npm 11, Vite, and vanilla TypeScript.
- Add no dependencies, network assets, backend, or storage.
- Keep the page shell, Results notice, and draft warning. Do not add voting, results, or edit-after-save behavior.

## File map and Testing Value Gate

- `index.html`: first-use copy and option hint.
- `src/main.ts`: row removal, validation feedback, and the existing saved view.
- `src/style.css`: spacing for the secondary remove control.
- `src/poll.ts` and `tests/poll.test.ts`: unchanged. The existing tests cover the model contract through `createPoll`.

Browser tests have value because they observe input, focus, feedback, and submission. Use the repeatable browser cases here for RED and GREEN. The repository has no browser test runner. Do not add a dependency or extract a DOM seam for a new unit test. Do not add a snapshot test of static copy.

## Review focus

- Two usable options with a blank **initial** row: Task 2 tests that the message does not offer removal.
- Removal of the row that holds the alert: Task 2 tests that the next save can show a new visible error.
- Addition after a middle row disappears: Task 2 tests stable, unique labels and IDs.
- Enter from an input: Task 2 tests the same validation order as the save button.
- Narrow view and a long form: Task 2 tests visible focus and feedback without horizontal overflow.

## Visual explanation

```text
1. First-use entry (index.html) → copy disappears on save
2. Correct an invalid draft (src/main.ts + src/style.css)
   model result → visible blank row check → error or saved view
                         ↑
                 add or remove extra rows
   Finish with browser checks and existing model tests
```

### Task 1: Guide a teammate into the form

**Files:** Modify `index.html`.

**Interfaces:** The creation content remains under `#creation`. Keep all existing form IDs and control types.

- [ ] Run `npm ci`. Expected: npm installs the locked dependencies.
- [ ] Run `npm run dev -- --host 127.0.0.1` in a separate terminal. Expected: Vite prints a local URL.
- [ ] Open the page at that URL. Expected RED: the page says **Create a poll** without first-use guidance.
- [ ] Change the `#creation` heading to **No lunch poll yet**. Insert the guidance from the spec between the heading and form. Keep the Results notice unchanged.
- [ ] Reload at 320 and 1280 CSS pixels. Expected GREEN: the guidance leads into the form, no error appears, and the page has no horizontal overflow. Save a valid two-option poll. Expected: the guidance disappears, the saved question has focus, and Results stays unchanged.
- [ ] Run `git add index.html && git commit -m "feat: guide first-time poll creation"`. Expected: one commit with the first-use copy.

### Task 2: Explain and recover from incomplete input

**Files:** Modify `index.html`, `src/main.ts`, and `src/style.css`.

**Interfaces:** Use `createPoll(question: string, optionLabels: readonly string[]): CreatePollResult` unchanged. Keep the existing `showError(input: HTMLInputElement, message: string)` and `showPoll(poll: Poll)` behavior. Add private `resetError(): void` for the shared feedback cleanup.

- [ ] At the local URL, submit **Lunch?** with **Pizza**, **Tacos**, and a whitespace-only extra input. Expected RED: the form saves and drops the extra input. The required behavior is to keep the draft and focus that input with a row error.
- [ ] Change `#options-hint` to **Enter at least two lunch options. You can remove extra options.** Use a private counter that starts at 3 for added rows. Append a native `type="button"` with text **Remove option** and accessible name **Remove option N** to each added row. Give that button a `.remove-option` class. Add `margin-top: .45rem` in `src/style.css`. Keep the existing focus rules.
- [ ] In `resetError`, call the current cleanup callback. Clear the callback and error text. If the alert is inside `#option-fields`, move the empty alert after the question row. Do not detach it with a removed row. Use this function on submit and before removal. After removal, focus **Add option**. Keep all other inputs and IDs intact. Recompute the existing draft guard after removal from the inputs that remain.
- [ ] In submit, keep `preventDefault()` and call `resetError()`. Query the current inputs in DOM order. Call `createPoll` with their raw values and find the first whitespace-only or empty option with `trim()`. Check model errors first. On `question-required`, show the question message. On `options-required`, show the count message on the first blank input. That input exists because the two initial fields cannot be removed. On model success with a blank input, show the appropriate blank-row message from the spec. Detect a removable row by its `.remove-option` button. Only call `showPoll(result.poll)` when both checks pass.
- [ ] In `revealError(input: HTMLInputElement)`, measure the associated label, input, and error rectangles, not the whole `.field`. If those three fit, reveal them together. Otherwise keep the existing input-plus-error fallback and final `scrollIntoView` fallback. Do not include the remove button in either rectangle.
- [ ] Keep the Vite server running for the browser cases. Use a fresh page for each case unless the row says to continue. Use a nonblank question unless the case concerns the question error. Expected GREEN:

| Action | Browser assertion |
| --- | --- |
| Submit whitespace-only question and blank options. | The question gets focus and **Enter a poll question.** The input has `aria-invalid="true"` and `aria-describedby` includes `poll-error`. |
| Continue the previous case. Fill the question and `Option 1` with `Pizza`. Press Enter in `Option 1`. | `Option 2` gets focus and **Enter at least two lunch options.** Question error attributes clear. Entered text remains. |
| Fill initial options and add two blank extra rows. Save. Fill the first blank row and save again. | The form does not save. **Enter a lunch option or remove this field.** follows the first blank input in DOM order. After correction, feedback moves to the next blank input and clears the old input attributes. |
| Continue the previous case. Remove the row that holds the error with its keyboard button. Clear an initial input and save. | Removal does not save. Focus returns to **Add option**. Error text clears. The next save shows a visible **Enter a lunch option.** next to the initial input. |
| Leave `Option 1` blank. Fill `Option 2` and `Option 3`. | Save focuses `Option 1` and says **Enter a lunch option.** It does not offer removal. |
| Use the keyboard to add `Option 3` and `Option 4`, remove `Option 3`, and add another row. | Each add focuses the new input without saving. Surviving values stay intact. The new label targets `option-5`. The label and ID of `Option 4` stay unchanged. |
| At 320 and 1280 CSS pixels, submit a long form with two filled options and its first blank added row off screen. | Focus is visible. The label, input, and message are visible together if they fit. The viewport has no horizontal overflow. |
| At 320 CSS pixels, shrink the viewport height until the label, input, and error fit but the whole row with its remove button does not. Fill two options. Start with the first blank added row off screen and submit. | After the scroll, the label, input, and error all fit in the viewport. The remove button need not be visible. |
| Fill the remaining fields, including duplicate labels and markup-like text. Save. | The form and first-use copy disappear. The saved question has focus. Text appears literally. Options keep input order and duplicates. Results stays unchanged. |
| Enter text only in an extra row. Remove that row and reload after keyboard interaction. | The page has no draft to warn about. On a separate trial, retain a nonblank draft and attempt to reload. The existing draft warning still applies. |

- [ ] Run `node --test tests/poll.test.ts` and `npm run check`. Expected: all seven model tests pass, TypeScript reports no errors, and Vite builds.
- [ ] Run `git add index.html src/main.ts src/style.css && git commit -m "feat: explain incomplete lunch poll drafts"`. Expected: one commit with form feedback and recovery changes.
## Planning review

Combined scope: this plan, the [spec](../specs/2026-11-23-issue-7-add-validation-empty-states-and-error-states-design.md), both inline sketches, and the mockup. Both passes used `reviewer`, `openai-codex/gpt-6.2-sol`, thinking `xhigh`. Base: `2a130db24effd3b2c812ec2b082a817e07a721e1`.

### Initial pass

- Spec body SHA-256: `cc6fc55358dee9d9865dd6464fa01e2f76214300eee978de755216948ca3fce5`.
- Plan body SHA-256: `f9b7936806a189123d378050e576b0148c2c82ace71081799fddb58df1aad2f1`.
- Survey: The form uses the unchanged `createPoll` interface. Row controls and feedback stay local to the DOM. All seven model tests passed.
- B1 (blocker), **Accepted**: Update Task 2, the spec, and the mockup to exclude the button from error bounds. Add a short-height check.
- S1 (suggestion), **Accepted**: Exercise keyboard addition and focus in Task 2.
- S2 (suggestion), **Accepted**: Name the spec in the mockup comment.
- Limits: Static inspection, model tests, and synthetic scroll bounds. No live browser or build in the review.

### Scoped confirmation

- Reviewed and final spec body SHA-256: `f1e903e9569dad2284d75bbcd3c393213b857e9f920da88cd6db72781683c8dc`.
- Reviewed and final plan body SHA-256: `890ee4a03ebb817f797781db7df1866be4a1cfc1b9d4945a6c0c8455d7bb259c`.
- B1 remains after the accepted design revision. A synthetic 125 px label-input-error span in a 180 px row passed with either helper at 179 px. At 134 px, only the new helper showed the label. The next revision must require RED with the button present and old helper in place, then GREEN with the same viewport.
- S1 follow-up, **Rejected as a separate blocker**: The plan requires a native `type="button"` control. An empty-alert assertion would strengthen the browser check but is not required to resolve B1.
- S2 is confirmed. The conceptual sketches and mockup match the revised design.
- Limits: The confirmation used synthetic scroll bounds and existing model tests, not a live browser or build.
- Outcome: `blocked`. A new planning revision and review are required before implementation.
