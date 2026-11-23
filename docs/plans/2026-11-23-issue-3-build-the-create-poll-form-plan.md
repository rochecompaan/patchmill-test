# Create the Lunch Poll Implementation Plan

> **For agentic workers:** Use `.patchmill/skills/executing-plans/SKILL.md` to execute this plan inline, task by task. Steps use checkbox syntax for tracking.

**Goal:** Let a teammate create a local lunch poll and see it in the workspace after save.

**Architecture:** The poll module validates input and builds a snapshot. The browser entry collects form values and shows either an error or the saved poll in the creation notice.

**Tech Stack:** Node.js 24 LTS, npm 11, Vite, vanilla TypeScript, HTML, CSS, and Node's test runner.

**Spec:** [Issue #3 design](../specs/2026-11-23-issue-3-build-the-create-poll-form-design.md).

## Inputs

- [Issue #3 design and its visual explanation](../specs/2026-11-23-issue-3-build-the-create-poll-form-design.md#visual-explanation).
- [Full-page mockup](../mockups/2026-11-23-create-poll-form.html).
- [Issue #2 model design](../specs/2026-11-23-issue-2-define-the-poll-option-and-vote-data-model-design.md) and [glossary](../../GLOSSARY.md).

## Global Constraints

- Use Node.js 24 LTS, npm 11, Vite, and vanilla TypeScript.
- Use no new dependencies, remote assets, backend, or persistent storage.
- Keep the existing Results notice and page shell.

## Review Focus

- Whitespace-only text must not meet the minimum. Test the creation interface in Task 1.
- Blank inputs between options must not discard later choices. Test the creation interface and smoke-check the form.
- Duplicate labels must have distinct IDs. Test the creation interface in Task 1.
- Markup-like text must show literally. Check the saved browser view in Task 2.
- An invalid save must retain values and focus the first error. Check both error paths in Task 2.

## Visual explanation

```text
1. src/poll.ts + tests/poll.test.ts
   Prove the creation rules at createPoll
        │ result: valid snapshot or reason
        ▼
2. index.html + src/main.ts + src/style.css + README.md
   Wire the form to createPoll → check the production preview
```

### Task 1: Create a valid poll snapshot

**Files:** Modify `src/poll.ts` and `tests/poll.test.ts`.

**Interfaces:** Consumes the existing `Poll` type. Produces `createPoll(question: string, optionLabels: readonly string[]): CreatePollResult`. Export `CreatePollResult` as `{ ok: true; poll: Poll } | { ok: false; reason: 'question-required' | 'options-required' }`.

- [ ] **Add the behavior tests.** Import `createPoll` into `tests/poll.test.ts` alongside the existing import. Use the existing `test` and `assert` imports.

  ```ts
  test('rejects a blank question before checking options', () => {
    assert.deepEqual(createPoll(' \t ', []), { ok: false, reason: 'question-required' });
  });

  test('rejects fewer than two nonblank options', () => {
    assert.deepEqual(createPoll('Lunch?', ['Pizza', ' \t ']), {
      ok: false, reason: 'options-required',
    });
  });

  test('creates a poll with exactly two options', () => {
    const result = createPoll('Lunch?', ['Pizza', 'Tacos']);
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.poll.options.map(({ label }) => label), ['Pizza', 'Tacos']);
  });

  test('trims text, skips blanks, and assigns distinct IDs in input order', () => {
    const options = Object.freeze([' Pizza ', '  ', 'Tacos', 'Pizza', '']);
    const expected = {
      ok: true, poll: {
        question: 'Lunch?',
        options: [
          { id: 'option-1', label: 'Pizza' },
          { id: 'option-2', label: 'Tacos' },
          { id: 'option-3', label: 'Pizza' },
        ],
        votes: [],
      },
    };
    const first = createPoll(' Lunch? ', options);
    const second = createPoll(' Lunch? ', options);
    assert.deepEqual(first, expected);
    assert.deepEqual(second, expected);
    if (first.ok && second.ok) assert.notStrictEqual(first.poll, second.poll);
  });
  ```

- [ ] **Run RED.** Add a typed `createPoll` stub that returns `{ ok: true, poll: { question, options: [], votes: [] } }`. Run `node --test tests/poll.test.ts`. Expected: all four new tests fail assertions. The three existing count tests pass.
- [ ] **Implement the interface.** Trim and check the question first. Trim the labels and retain only nonempty values. If fewer than two labels remain, return `options-required`. Otherwise, map the retained labels to options with one-based IDs. Return a fresh poll with an empty `votes` array. Do not change the existing tally.
- [ ] **Run GREEN.** Run `node --test tests/poll.test.ts`. Expected: seven tests pass.
- [ ] **Commit.** Run `git add src/poll.ts tests/poll.test.ts && git commit -m "feat: create validated lunch poll snapshots"`. Expected: a commit with the model and tests.

### Task 2: Create and show the poll in the workspace

**Files:** Modify `index.html`, `src/main.ts`, `src/style.css`, and `README.md`.

**Interfaces:** Consumes `createPoll(question: string, optionLabels: readonly string[]): CreatePollResult` and `Poll`. Produces the browser workflow at `/`. No new TypeScript exports.

- [ ] **Record browser RED.** Run `npm ci` and `npm run dev`. Open the printed local URL. Expected: install succeeds, Vite serves the app, and the creation notice still has no form. No DOM test dependency is necessary. The real browser check covers form submission, focus, and layout.
- [ ] **Add the form markup.** Keep the existing creation notice and `h3`. Replace its placeholder paragraph with the spec's form. Use `id="create-poll-form"`, `name="question"`, and repeated `name="option"` fields. Give each label and input a unique association. Add `novalidate`, an empty alert, and buttons of type `button` and `submit` respectively. Keep the option fields in a dedicated container before the buttons. Mark the initial inputs and buttons `disabled` in HTML.
- [ ] **Wire addition and validation.** In `src/main.ts`, append a labeled field with the next number when the user selects Add option. Focus the input without rebuilding the form. On `submit`, prevent navigation. Read the question and collect option inputs in DOM order. Pass their values to `createPoll`. On failure, keep the inputs. Follow the spec's error text, focus, and accessible description rules. Clear prior error attributes and text before reporting a new outcome. Enable the initial controls only after both event handlers are attached.
- [ ] **Show the snapshot.** On success, replace the creation notice children with an `h3` and a `ul` of option labels. Assign all poll text via `textContent`. Set the heading's `tabIndex` to `-1` and focus it. Leave the Results notice intact.
- [ ] **Match the mockup.** In `src/style.css`, scope the new form rules to the creation notice. Use the existing color tokens, stacked labels, and wrapping actions. Prevent fieldset and input sizing from widening the grid. Add visible focus styles. Do not add motion or change the existing notice breakpoint.
- [ ] **Update the README.** Replace the stale placeholder sentence in the run instructions. Explain that the form saves one poll for the current page, that reload clears it, and that results are not available yet. Keep the Patchmill instructions.
- [ ] **Run automated checks.** Run `node --test tests/poll.test.ts` and `npm run check`. Expected: seven tests pass, TypeScript exits successfully, and Vite builds `dist/`.
- [ ] **Check the production preview.** Run `npm run preview` and open its printed URL. Expected: the page opens without app errors. Use the cases that follow. Check the layout at 320 and 1280 CSS pixels. Expect readable fields, visible focus, and no horizontal scroll.

  | Action | Expected result |
  | --- | --- |
  | Load the page with JavaScript disabled. | The form controls remain disabled and cannot submit. Restore JavaScript and reload before the next case. |
  | Type `Pizza` in Option 1. Leave the question blank. Select Save poll. | The question receives focus and its error. Option 1 retains `Pizza`. |
  | Enter `Lunch?` as the question. Leave Option 2 blank. Submit with Enter from the question. | The option error replaces the question error. Option 2 receives focus. All text stays in place. |
  | Fill Option 2 with `Tacos`. Submit with Enter. | `Lunch?` receives focus as a heading. The list shows Pizza, then Tacos. The form is absent. Results is unchanged. |
  | Reload. Enter ` <b>Lunch?</b> ` and ` Pizza `. Leave Option 2 blank. Activate Add option twice by keyboard. | The fresh form has two fields before addition. Each activation appends and focuses one numbered field. Nothing submits and no values change. |
  | Enter `<i>Tacos</i>` in Option 3 and `Pizza` in Option 4. Select Save poll. | The heading shows literal `<b>Lunch?</b>` text. The list shows `Pizza`, literal `<i>Tacos</i>`, and `Pizza` in order. Results is unchanged. |

- [ ] **Commit.** Run `git diff --check`. Expected: no whitespace errors. Run `git add index.html src/main.ts src/style.css README.md && git commit -m "feat: add the create poll form"`. Expected: a commit with the form and its run instructions.

## Planning review

Combined scope: this plan, the [specification](../specs/2026-11-23-issue-3-build-the-create-poll-form-design.md), their inline visuals, and the linked mockup.

Reviewer for both passes: `reviewer`, `openai-codex/gpt-6.2-sol`, thinking `xhigh`.
Base: `ad3b5b37492741b4545a3264985f5761fa4965dd`.

### Initial pass

- Spec body SHA-256: `783e8e79178fcce04629be07ff280d5a6cad99dc3b0cb745226a301a1df08f3b`.
- Plan body SHA-256: `2c6ba3202f339f34fa63a13cafa597fab244d8da54a65cfd03da997531402ff7`.
- Survey: One context. The poll module retains ownership of snapshots and tally rules. Browser code owns the form and saved view. All three existing tests passed.
- B1 (plan blocker), **Accepted**: Use a typed success stub with empty options so all four new tests fail in RED.
- S1 (spec, plan, and mockup suggestion), **Accepted**: Disable initial controls until both handlers attach. Add a JavaScript-disabled smoke case.
- S2 (plan suggestion), **Accepted**: Check literal markup-like text in an option as well as the question.
- Result: not ready. Review used static inspection, the existing tests, and an in-memory RED probe.

### Scoped confirmation

- Reviewed and final spec body SHA-256: `e0f233f5989221f671defda3c08db47808e3a3cfb7ec8552262b79deb58aea02`.
- Reviewed and final plan body SHA-256: `f603aebaaea0cec4fcd806a3c7899f94dca522c2691e537846c1491dd511542f`.
- All dispositions confirmed. The reviewer reproduced four RED assertion failures and three passing tally tests. Both inline visuals and local mockup links remain consistent.
- Limits: The reviewer inspected the mockup statically. The planner inspected its initial layout from disk at 320 and 1280 pixels. Production build, browser flows, and accessibility checks remain for implementation.
- Outcome: `ready`.
