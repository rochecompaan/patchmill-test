# Create-poll Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan inline, task by task. Steps use checkbox syntax for tracking.

**Goal:** Create a lunch poll with a question and at least two options, then show it in place of the form.

**Architecture:** A pure conversion module validates draft text and creates the existing `Poll` aggregate. A DOM module manages the form and saved view. `src/main.ts` connects the UI without storage.

**Tech Stack:** Plain TypeScript, Vite, Node.js 24 LTS, npm 11, and Node's built-in test runner.

**Spec:** `docs/specs/2026-11-06-issue-3-build-the-create-poll-form-design.md`

**Mockup:** `docs/mockups/2026-11-06-issue-3-build-the-create-poll-form.html`

## Global Constraints

- Use Node.js 24 LTS and npm 11. Keep plain TypeScript, Vite, and the existing test runner.
- Do not add dependencies, storage, vote controls, vote totals, winner logic, authentication, or network requests.
- Keep `src/poll.ts` unchanged. It defines the shared model, not form validation.
- Trim the question and all labels on save. Require a nonempty question and at least two nonempty labels.
- Reject every blank option, including an added option. Do not silently discard blank fields.
- Duplicate option labels are valid. Preserve their order and assign different IDs.
- Use text nodes or `textContent` for user input, never HTML interpolation.
- Preserve the scaffold palette, typography, 960px panel, and breakpoint below 640px.
- One poll per page load is sufficient. Do not add editing, option removal, reset, or replacement controls.

## Review Focus

1. Whitespace-only values must fail without consuming IDs or losing the draft. Task 1 covers conversion. Task 2 covers the retained UI draft.
2. Duplicate labels must retain their order and independent IDs. Task 1 covers the aggregate.
3. Markup-like input must appear literally. Task 2 covers browser output.
4. Keyboard add/save must retain values and move focus predictably. Task 2 covers the browser flow.
5. Long text, narrow screens, and zoom must not clip content. Task 2 covers responsive review.

## File map and verification choice

- Create `src/create-poll.ts`: pure validation and `Poll` construction.
- Create `tests/create-poll.test.ts`: production conversion behavior with deterministic IDs.
- Create `src/poll-form.ts`: DOM event handling, draft collection, and saved-poll display.
- Modify `src/main.ts`: import styles and initialize the UI.
- Modify `index.html`: semantic form and saved-view containers, accurate placeholder copy.
- Modify `src/style.css`: form controls, error text, saved list, and responsive sizing.
- Modify `README.md`: describe creation, page-only state, and behavior tests.
- Create `docs/validation/create-poll-form.md`: commands, browser scenarios, and review findings.
- Add implementation screenshots under `docs/screenshots/` through the visual-evidence workflow.

Testing Value Gate: automate pure conversion behavior because invalid input can create unusable polls or unstable options.
Use direct browser checks for DOM events, focus, literal text, and responsive layout with the current dependency-free tooling.
Do not add tests for document text, static HTML strings, CSS values, or configuration.
Do not introduce a test framework for this issue.

## Task 1: Validated poll creation

**Files:** Create `src/create-poll.ts` and `tests/create-poll.test.ts`.

**Interfaces:**

- Consume `Poll` from `src/poll.ts` through a type-only import.
- Export `createPoll(question: string, labels: readonly string[], makeId: () => string): Poll | null`.
- Return `null` for blank trimmed question, fewer than two labels, or any blank trimmed label.
- On success, call `makeId` once for the poll, then once per option in input order. The factory guarantees distinct nonempty IDs.
- Return new arrays and records with `votes: []`. Never mutate input or generate IDs on invalid input.

- [ ] **Step 1: Write failing behavior tests.** Use `node:test` and `node:assert/strict`, as in `tests/poll.test.ts`.
  - `creates a trimmed poll with two options`: use question `' Where for lunch? '` and labels `[' Deli ', ' Pizza ']`.
    With factory IDs `['poll-1', 'option-1', 'option-2']`, assert the exact aggregate and empty votes.
  - `preserves added options and duplicate labels`: use `['Deli', 'Deli', 'Pizza']`. Assert labels in order and distinct option IDs.
  - `rejects incomplete drafts without generating IDs`: cover empty and whitespace questions, zero or one label, blank initial labels, and blank third labels.
    Assert `null` and zero factory calls for every case.
  - `does not mutate caller input`: pass a frozen label array. Assert trimmed output and unchanged input.
  - `preserves special text as data`: use `'<img src=x onerror=alert(1)>'`, Unicode, and long strings. Assert exact text preservation.
- [ ] **Step 2: Run `node --test tests/create-poll.test.ts`.** Expect failure because the module does not exist.
- [ ] **Step 3: Implement `createPoll` with the specified signature.** Trim and validate before any ID generation.
- [ ] **Step 4: Run `npm test` and `npm run check`.** Expect all behavior tests and strict TypeScript checks to pass.
- [ ] **Step 5: Commit the module and its tests.** Use `feat: create validated lunch poll values`.

## Task 2: Form and saved-poll flow

**Files:** Create `src/poll-form.ts`. Modify `index.html`, `src/main.ts`, `src/style.css`, and `README.md`.
Create `docs/validation/create-poll-form.md` and implementation screenshots.

**Interfaces:**

- Consume `createPoll(question, labels, makeId)` from Task 1 and the shared `Poll` type.
- Export `initPollForm(root: HTMLElement): void` from `src/poll-form.ts`. Initialize once against `#main` in `src/main.ts`.
- Keep `currentPoll: Poll | null` inside initialization scope. Use `crypto.randomUUID()` as the ID factory.
- Use stable DOM hooks: `#create-heading`, `#create-form`, `#question`, `#options`, `#add-option`, `#form-error`, `#saved`, `#saved-options`.
- Every option input uses `name="option"`, a unique `option-N` ID, and an explicit visible label. Start with two fields.
- Keep the saved heading and list accessible through the creation section's existing label relationship.

- [ ] **Step 1: Establish the failing browser baseline.** Run the scaffold and record that no creation controls exist.
- [ ] **Step 2: Replace the creation placeholder with the mockup's semantic form and hidden saved container.**
  Use `novalidate`, `required` inputs, and `aria-describedby="form-error"` so one consistent validation path handles whitespace.
  Use the spec's exact labels, buttons, validation message, page-only note, and results note.
- [ ] **Step 3: Implement `initPollForm(root: HTMLElement): void`.**
  Append labeled inputs through DOM creation on “Add option”. Preserve prior values and focus the new input.
  On submit, prevent navigation and read question plus ordered option values.
  Call `createPoll` with the browser ID factory. On rejection, retain values, show the alert, and focus the first blank field.
  On success, assign the poll to page state. Hide the form, populate the heading and option list with text nodes, and focus the heading.
  Never show vote counts or reuse labels as IDs. Do not reload or persist the page.
- [ ] **Step 4: Initialize from `src/main.ts` and add form styles.**
  Match the mockup. Keep 44px minimum targets, 16px input text, visible focus, wrapping text, and no motion.
  Use shrinkable grid columns and `min-width: 0` where needed to prevent input overflow.
- [ ] **Step 5: Run browser behavior checks.**
  Create a two-option poll, then refresh and create a three-option poll. Assert the correct question and ordered labels, with no creation placeholder.
  Enter values before adding a field. Assert they remain and focus moves to the new field.
  Submit with Enter. Assert save works without navigation. Activate “Add option” with the keyboard. Assert it does not save.
  Submit blank, whitespace-only, and blank-added-option drafts. Assert the exact alert, retained values, and focus on the first blank input.
  Correct the draft and save. Assert no stale error appears in the saved view and focus moves to the saved heading.
  Save duplicate labels and assert both appear. Save `<img src=x onerror=alert(1)>` and assert literal text with no created image.
  Refresh the saved page. Assert the form returns with two blank fields and no saved poll.
  Record the alert semantics and keyboard order in the validation document.
- [ ] **Step 6: Verify responsive behavior and capture visual evidence.**
  Read and follow `patchmill-visual-evidence` for committed implementation screenshots.
  Inspect at 1440px, 390px, 320px, and 200% zoom. Include long unbroken question and option text.
  Assert no horizontal page overflow, clipped controls, or inaccessible buttons. Verify reduced-motion behavior remains static.
  Capture desktop creation, mobile creation, and saved-poll states. Record screenshot paths in the validation document.
- [ ] **Step 7: Update the README and run final checks.**
  Document creation and the refresh limitation. Keep voting, results, and persistence explicitly unavailable.
  Run `npm test`, `npm run check`, `npm run build`, and `git diff --check`. Expect zero failures.
  Record actual commands and browser findings in `docs/validation/create-poll-form.md`.
- [ ] **Step 8: Review the frontend delivery.** Read and follow `patchmill-frontend-review` after implementation validation.
  Resolve findings and repeat affected checks. Keep the implementation aligned with the spec and mockup.
- [ ] **Step 9: Commit the UI, documentation, and evidence.** Use `feat: add create-poll form and saved poll view`.

## Planning self-review

The tasks cover every behavior and scope boundary in the spec. The conversion module owns creation rules, not DOM state.
The browser checklist covers the event, focus, safe-text, and layout boundaries that the Node suite cannot exercise.
The plan requires inline execution, no subagents, and no additional dependencies. Planning artifacts stay in the implementation branch.
