# Create a lunch poll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the installed `executing-plans` skill for inline execution, task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not start implementation before Patchmill records maintainer approval.

**Goal:** Replace the creation placeholder with a working form that shows a poll after saving.

**Architecture:** One DOM module owns the complete creation lifecycle through `mountPollApp(root: HTMLElement): void`. The entry point mounts it once. The existing domain model remains browser-independent and unchanged.

**Tech Stack:** TypeScript, Vite, native HTML controls, Node 24 test runner, and jsdom for DOM behavior tests.

**Spec:** [Create a lunch poll](../specs/2026-11-20-issue-3-build-the-create-poll-form-design.md).

## Global Constraints

- Keep TypeScript, native HTML controls, Vite, and the current visual language. No UI framework or runtime dependency is necessary.
- Require a nonblank question and at least two nonblank options.
- Require every displayed option. An extra blank option blocks saving rather than disappearing silently.
- Accept duplicate labels as separate options. Preserve their order and internal whitespace.
- Keep that poll in application memory. Do not call localStorage, sessionStorage, or a network service.
- Insert user text with `textContent` or text nodes, never interpolated HTML.
- Do not impose a product-specific option limit or text-length limit.
- Do not add animation. The result remains usable with reduced motion.
- Use Node.js 24 LTS and npm 11, as required by the repository.
- Keep the existing poll model and counting tests unchanged.

## Review Focus

1. Whitespace-only fields block saving, retain draft values, and focus the first invalid field. Task 1 covers this.
2. Added rows preserve previous values and remain required. Task 1 covers repeated additions and a blank extra row.
3. Duplicate labels and Unicode remain ordered, distinct list entries. Task 1 covers both.
4. HTML-like text stays literal and long text wraps without horizontal scrolling. Tasks 1 and 2 cover these separately.
5. Correction, stale submissions, keyboard submission, and reload do not lose or overwrite data unexpectedly. Tasks 1 and 2 cover these.

## Inputs and file responsibilities

Read the specification, its inline visual explanation, and [the full-page mockup](../mockups/2026-11-20-create-poll-form.html).
Also read `GLOSSARY.md`, `PROJECT_BRIEF.md`, `src/domain/poll.ts`, `tests/poll.test.mjs`, and the existing stylesheet.
The prior model specification is context, not scope: `docs/specs/2026-11-20-issue-2-define-the-poll-option-and-vote-data-model-design.md`.
There is no Parent spec or outstanding planning merge gate.

| File | Responsibility |
| --- | --- |
| `src/poll-app.ts` (new) | DOM module, private draft controls, validation, current poll, and saved view |
| `src/main.ts` | CSS import and one workspace mount |
| `index.html` | Existing header, stable workspace target, and accurate memory-only note |
| `src/style.css` | Form controls, action layout, saved-text wrapping, and focus appearance |
| `tests/poll-app.test.mjs` (new) | Production module behavior through its DOM interface |
| `package.json`, `package-lock.json` | jsdom development dependency and common test command |
| `README.md` | Current app capabilities, state lifetime, and test instructions |
| `docs/create-poll-validation.md` (new) | Implementation browser checks, evidence paths, and limitations |
| `docs/screenshots/create-poll-*.png` (new) | Actual app reference states, not mockup images |

Aim for a cohesive UI module under roughly 200 meaningful lines. Use private helpers before introducing more modules.
The form, validation, and saved view share one lifecycle, so separate control modules add no useful seam.

## Task 1: Deliver the creation lifecycle with interface tests

**Files:** Create `src/poll-app.ts` and `tests/poll-app.test.mjs`. Modify `src/main.ts`, `index.html`, `src/style.css`, `package.json`, `package-lock.json`, and `README.md`.

**Interfaces:**
- Consumes the existing `Poll` type from `src/domain/poll.ts` with ordered options and anonymous votes.
- Produces `mountPollApp(root: HTMLElement): void`, mounted once per root in an HTML document.
- Mount synchronously replaces the workspace. The caller passes the root. The module uses `root.ownerDocument` and standard crypto.
- No teardown, state getter, test-only export, custom adapter, or persistence interface is necessary.

- [ ] **Step 1: Add the test dependency and shared command.**

Run `npm install --save-dev jsdom` from the issue worktree.
Retain the existing Node/npm engine constraints and commit the resulting lockfile later in this task.
Add `"test": "node --test tests/*.test.mjs"` to the scripts.
Do not change Vite or TypeScript versions to accommodate this feature.

- [ ] **Step 2: Write the failing DOM interface tests.**

Import `mountPollApp` directly from `../src/poll-app.ts` in the `.mjs` tests, as the existing suite imports erasable TypeScript.
Use `import type` for the module's `Poll` dependency so Node needs no runtime domain import.
Create a fresh jsdom document for each test, append a workspace root, mount it, and close the window after the test.
Do not modify global DOM constructors. Production code must work with the supplied document.
Use visible labels, button text, roles, inputs, lists, and focus as assertions, not private helper names.

The initial-state test includes these assertions:

```js
const inputs = [...root.querySelectorAll('input')];
assert.equal(inputs.length, 3);
assert.deepEqual(inputs.map(input => input.labels[0].textContent),
  ['Poll question', 'Option 1', 'Option 2']);
assert.ok(inputs.every(input => input.required && input.value === ''));
assert.ok(root.querySelector('fieldset legend'));
assert.equal(root.querySelectorAll('ol li').length, 0);
```

Add named behavior cases with these exact outcomes:

| Test | Actions and assertions |
| --- | --- |
| `adds required options without losing draft values` | Set question `Lunch?` and labels `Soup`, `Wrap`. Click Add option twice. Assert five total inputs, labels Option 3/4, unchanged first values, and focus on the newest required input. Assert no saved list exists. |
| `saves two trimmed options and replaces the form` | Submit question `  Lunch?  ` and options ` Soup `, ` Wrap `. Assert heading `Lunch?`, list `['Soup', 'Wrap']`, message `Poll created.`, no form or creation buttons, and heading focus. |
| `saves every added option in order` | Add two rows and submit `['Soup', 'Wrap', 'Salad', 'Sushi']`. Assert exactly that ordered list. |
| `retains duplicates and literal text` | Use Unicode question `寿司 <img src=x onerror=alert(1)>?` and labels `['Café  bowl', 'Café  bowl', '<script>bad()</script>']`. Assert literal strings, retained internal spaces, three separate list items, and no user-created `img` or `script` nodes. |
| `rejects blank fields and accepts correction` | Table-drive each initial field and an added row with `''` and `'   '`. Fill all other fields. Submit. Assert no saved list, unchanged draft values, focus on the first invalid field, and exact custom validation message from the spec. Correct that field and dispatch input. Assert its custom error clears and the next submit succeeds. |
| `ignores stale submissions after save` | Retain the original form. Save once and assert the form disappears. Change its detached controls. Reattach that retired form hidden under the workspace solely to restore its bubbling path. Dispatch a cancelable, bubbling submit from that form, then remove it. Assert cancellation and unchanged saved question/list. |
| `fresh mounts start empty` | Save in one document. Mount into a fresh document. Assert the fresh form is empty and the first view does not change. This proves mount independence, not browser reload. |

For submission, dispatch a bubbling, cancelable `submit` event from the form and assert `defaultPrevented`.
Add a multiple-error case: leave the question and Option 2 blank. Assert question focus first, then Option 2 focus after question correction.
Dispatch an `input` event after programmatic corrections, as a real edit does.
jsdom can assert validity state and focus, but does not prove native validation bubbles or Enter behavior.

- [ ] **Step 3: Run the tests before production changes.**

Run `npm test`. Expect the new suite to fail because `src/poll-app.ts` does not exist.
The existing poll suite must continue to pass.

- [ ] **Step 4: Implement the production module and entry point.**

Export `mountPollApp(root: HTMLElement): void` from `src/poll-app.ts`.
Keep `currentPoll: Poll | null` and private DOM helpers in its closure.
Use delegated root listeners for Add option, input, and submit. Guard submission if a current poll exists.
Generate opaque poll and option IDs with `crypto.randomUUID()` only after successful validation. Start `votes` as an empty array.
Use the spec's validation order, exact messages, focus changes, and complete UI copy.
Keep literal user text out of HTML templates. Constant markup without user input is permissible.

Add `id="poll-workspace"` to the existing workspace in `index.html`.
Mount from `src/main.ts` after its CSS import with the existing module script's deferred execution.
If the target is missing, throw an explicit setup error rather than silently showing a broken scaffold.
Replace the obsolete note with the memory-only note. Remove stale placeholder markup that the module now owns.

- [ ] **Step 5: Style the real UI against the mockup.**

Extend `src/style.css` with scoped form rules, full-width 44px minimum inputs, clear labels, and flexible action rows.
Retain the existing 44rem workspace breakpoint, colors, font, top rule, and focus outline.
Use wrapping saved text and min-width zero. Keep the results panel as the same placeholder before and after creation.
No animation or preview-only mockup controls belong in production.

- [ ] **Step 6: Update current usage documentation.**

Update README capability statements that still call the page a static scaffold.
Explain creation, adding an option, Save poll, memory-only state, reload reset, and deferred voting/results.
Document `npm test` alongside the existing check and build commands.
Preserve the model documentation and unrelated demo instructions.

- [ ] **Step 7: Run the behavioral and compiler checks.**

Run `npm test`, `npm run check`, and `npm run build`.
Expect all tests to pass, no TypeScript errors, and a successful Vite bundle.
Inspect the implementation for the unchanged `Poll` contract, nonblank distinct IDs independent of labels, and `votes: []`.
Do not expose IDs or state only to make tests inspect them.

- [ ] **Step 8: Commit the tested feature.**

Run `git diff --check` and inspect `git diff --stat`.
Stage the Task 1 files explicitly.
Commit with `feat: add lunch poll creation form`.

## Task 2: Validate real-browser behavior and record visual evidence

**Files:** Create `docs/create-poll-validation.md` and screenshots under `docs/screenshots/`. Correct Task 1 files only for demonstrated defects.

**Interfaces:** Consumes the mounted app from Task 1. Produces committed browser evidence and a validation record. No new production interface.

- [ ] **Step 1: Start the approved local preview.**

Run `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort` after the successful build.
Wait until the preview URL responds and the Create a poll heading and Option 2 input are visible.
Use the actual built app, not the planning mockup.

- [ ] **Step 2: Inspect the real interaction flow.**

In a real browser, use Tab to reach each input and both buttons.
Fill the draft, add two options, and verify preserved values and new-input focus.
Submit with Enter and verify no navigation, saved heading focus, and four ordered labels.
In a fresh page, submit blank and whitespace-only fields, including an added row.
Verify native error presentation, first-invalid focus, correction, and retained draft values.
Reload a saved poll and verify the empty form returns with the memory-only note.
Verify no voting controls appear and no browser console errors occur.

- [ ] **Step 3: Inspect responsive and literal-text cases.**

Inspect at 1280×900 and 320×900, and at desktop 200% zoom.
Use a long unbroken question and a long option label. Verify wrapping, legibility, reachable controls, and no horizontal page scroll.
Use duplicate Unicode labels and HTML-like text. Verify literal display and no injected elements.
Verify visible focus, label associations, reading order, control heights, and the lack of motion.
These checks supplement DOM tests rather than repeat CSS-source assertions.

- [ ] **Step 4: Capture app evidence and record results.**

Follow the installed `patchmill-visual-evidence` skill.
Use available Playwright or approved project browser tooling with system Chromium.
If that tooling is unavailable, ask for a setup decision instead of silently installing new dependencies.
Wait for the relevant heading and visible controls or saved labels before each capture.
Save `docs/screenshots/create-poll-form-desktop.png`, `create-poll-form-mobile.png`, `create-poll-saved-desktop.png`, and `create-poll-saved-mobile.png`.
Use the same semantic sample question and options as the mockup preview.
Record viewport sizes, browser, commands, observed keyboard/validation/reload behavior, and evidence links in `docs/create-poll-validation.md`.
Record inspection limits honestly. Do not treat a mockup image as implementation evidence.

- [ ] **Step 5: Run final checks and commit the evidence.**

If a defect requires a code change, add a meaningful regression test where applicable.
Run `npm test`, `npm run check`, `npm run build`, and `git diff --check` again before browser rechecks.
After a correction, reload the preview against the new build and rerun affected browser checks.
Refresh affected screenshots and validation observations from that rebuilt preview before committing.
Stage the validation record, screenshots, and any reviewed corrections explicitly.
Commit with `docs: record create poll browser validation`.
Stop the preview server after inspection.

## Visual explanation

One feature task owns the lifecycle. Browser validation depends on its completed build.

```text
Spec + full-page mockup + existing Poll contract
  Task 1: dependency + failing DOM behavior tests
       -> one production mount module + shell/style integration
       -> README + passing tests/type check/build
       -> feature commit
  Task 2: built preview
       -> keyboard, native validation, reload, responsive checks
       -> actual app screenshots + validation record
       -> final checks + evidence commit
  Implementation review and frontend review -> Patchmill delivery
```

## Delivery boundary

Execute inline with the installed `executing-plans` skill on the supplied issue branch and worktree.
Follow Patchmill implementation and frontend-review procedures after validation.
Planning review of these documents does not replace implementation review or human approval.
The implementation PR must retain the specification, plan, and mockup alongside the code and visual evidence.
No base-branch push, force-push, issue comment, or label change is authorized.

## Open assumptions

No maintainer question remains open. The maintainer delegated remaining choices to the planner's recommendations.

## Planning review

### Initial combined review

- Scope: this document and `docs/specs/2026-11-20-issue-3-build-the-create-poll-form-design.md`.
- Reviewer: fresh-context canonical `reviewer`, model `openai-codex/gpt-6.2-sol`, thinking `high`.
- Inspected base: `7307d6f08264befe63aa55850ab2f98f83afe2ee`.
- Reviewed specification body SHA-256: `6c9e11189467333cc7299e72867229b8c8f03e11fc99b7a61d435848fdd2fb38`.
- Reviewed plan body SHA-256: `b841fc4a37da2bdcd0719708f897901e7a6793567de4e139994a87044ab7b926`.
- Survey: the existing entry point only imports CSS. The shared model owns ordered options, anonymous votes, and pure counting.
- The reviewer independently inspected the shell, model, tests, glossary, neighboring issues, inline diagrams, and linked mockup.
- B1 accepted: the stale-submit test now dispatches from the retired form with a restored bubbling path.
- B2 accepted: corrected code now requires a rebuild before browser rechecks and refreshed evidence.
- S1 accepted: the specification assigns ID invariant verification to implementation inspection, not private-state tests.
- S2 accepted: the plan adds a multiple-error case to prove first-invalid focus ordering.
- Limits: no browser, server, installation, build, or tests ran in review. Mockup portability received source inspection only.
- Initial conclusion: corrections required. Revised documents await fresh scoped confirmation.
- Outcome at this pass: `blocked` pending confirmation, not a maintainer decision.

### Fresh scoped confirmation

- Scope: both issue #3 documents, limited to B1, B2, S1, S2 and their effects.
- Reviewer: fresh-context canonical `reviewer`, model `openai-codex/gpt-6.2-sol`, thinking `high`.
- Inspected base: `7307d6f08264befe63aa55850ab2f98f83afe2ee`.
- Compared specification body SHA-256: `c2a449129927d176f12cf3080964299fb6c56270a8a3c61fe052be9e7574381f` (also in review scope).
- Reviewed and final plan body SHA-256: `ce13ce5e5c65915825a07b06f5de10eb41b5b29a12f23361fe2fa8f74ed1704b`.
- Confirmation: all four accepted findings resolved. No blocker, suggestion, or maintainer question remains open.
- The reviewer verified form-event targeting, rebuild-before-evidence ordering, inspection ownership, and first-invalid focus coverage.
- The source survey again covered the shell, model, counting tests, package scripts, and the DOM module seam.
- Limits: no browser, server, install, build, tests, or live host comment query in review. Mockup inspection was source-only.
- Planner self-review opened the mockup offline in Chromium at 1280×1200 and 375×1300 and inspected both screenshots.
- Outcome: `ready`. This is planning readiness, not human approval or implemented behavior.
