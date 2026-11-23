# Create the lunch poll — Issue #3

## Scope and approaches

[Issue #3](https://github.com/rochecompaan/patchmill-test/issues/3) lets a teammate enter a lunch question, add options, and see the poll after saving. The scaffold (#1) and the poll model (#2) are both on the inspected base. `index.html` holds the notices, `src/main.ts` imports CSS, and `src/poll.ts` defines the snapshot and `countVotes`.

Use an inline form in the existing creation notice. Replace only that notice's content on save. A modal adds a separate focus and dismissal flow. A second page adds navigation without making this short task clearer. The inline design preserves the workspace and leaves the Results notice in place.

This design extends the interface of an existing module but adds no architectural layer or domain relationship. Team Lunch Poll remains the only context. `GLOSSARY.md` and the Issue #2 model still define poll, option, and vote. A blank input is not an option. Two options can have the same label without sharing an ID. The minimum applies to this creation flow, not to all `Poll` snapshots. No glossary change or ADR is necessary.

Voting, results, editing, replacing a saved poll, and persistence are out of scope. **Save poll** creates one poll in the current page. A reload starts a new form.

## User flow

1. Open the workspace. The creation notice shows **Create a poll**, a **Poll question** input, and **Option 1** and **Option 2** inputs. The options group legend is **Lunch options**. The group hint is **Enter at least two lunch options.**
2. Select **Add option** to append one numbered input and focus it. Existing entries stay in place. The user can repeat this step. Add option never submits the form.
3. Select **Save poll**, or submit from a text input with Enter. Trim the question and each option label. Ignore blank option inputs, even between filled inputs. Require a nonblank question and at least two nonblank options. Keep duplicate labels and preserve the order of filled options.
4. If the question is blank, show **Enter a poll question.** and focus the question. Otherwise, if too few options remain, show **Enter at least two lunch options.** and focus the first blank option. Keep all values and fields. The next submit rechecks the inputs and replaces or clears the error.
5. On success, replace the form and creation heading with the poll question as an `h3` and its options as a plain list. Move focus to the question heading without adding it to the tab order. The Results notice stays unchanged. Show all poll text literally, never as HTML.

## Frontend design

Frontend design applies because this issue changes browser layout, interaction, and focus. Keep the scaffold's plum masthead, lilac page, mint workspace, Georgia title, and system sans-serif body. The existing design takes priority over a new visual style. Use paper-colored fields, ink text, and the existing rule color for field borders. Use plum for the primary save button. Keep **Add option** secondary. Stack the labels and inputs; let the buttons wrap without changing their order. Keep notices side by side from `40rem` and stacked below it. No motion is necessary.

Use a native form, text inputs with explicit labels, a fieldset and legend, and native buttons. Use a persistent empty error region with `role="alert"` in the form. Associate an active error with the focused input via `aria-describedby` and mark it `aria-invalid`. Before each submit check, clear the prior error and its attributes. Restore any prior description. Do not let browser constraint validation bypass this error flow. The form controls stay disabled until the browser entry attaches both event handlers. This prevents native submission before initialization.

## Module interface

`src/poll.ts` owns `createPoll(question: string, optionLabels: readonly string[]): CreatePollResult`. The result is `{ ok: true; poll: Poll }` or `{ ok: false; reason: 'question-required' | 'options-required' }`. The module applies the trim and blank-input rules. If both rules fail, it returns `question-required` first. It assigns nonempty, unique IDs to the retained options in order (`option-1`, `option-2`, and so on). IDs belong to one poll and do not depend on the labels. Each success returns a fresh snapshot with no votes. The function does not change the inputs or throw for invalid text. Time is linear in the number of inputs and their text length. Space is proportional to the retained text and rows.

The creation interface keeps validation, normalization, ID assignment, and snapshot shape local. Its depth gives the browser caller leverage: it supplies text and handles a result, not a partly valid poll. Node tests cross the same seam as `src/main.ts`. This pure computation needs no configuration, dependency injection, or adapters. Keep `Poll` and `countVotes` unchanged.

`index.html` owns the static page and form markup. `src/main.ts` owns the browser events, field addition, error display, and the transition to the saved view. The app needs no state beyond the page and the snapshot returned on save. Its browser interface is the form and the saved view. The browser DOM is the only runtime environment at this seam. Use a real browser for smoke checks, not a new adapter or a public seam for tests. Keep field names and DOM helpers private.

## Global constraints

- Use Node.js 24 LTS, npm 11, Vite, and vanilla TypeScript.
- Use no new dependencies, remote assets, backend, or persistent storage.
- Keep the existing Results notice and page shell.

## Acceptance and verification

| Requirement | Verification |
| --- | --- |
| Ask for a question and at least two options. | Run Node behavior tests for validation and snapshot creation. Submit missing values in a browser and check the message, focus, and retained input. |
| Add options before saving. | Add two options by keyboard. Check numbering, focus, retained values, and no submit. |
| Show the saved poll instead of the creation placeholder. | Save a two-option poll and a poll with extra inputs on separate page loads. Check the question, option order, literal text, heading focus, absence of the form, and unchanged Results notice. |
| Support a narrow screen and keyboard use. | Check at 320 and 1280 CSS pixels. Check visible focus and no horizontal scroll. |

## Visual explanation

```text
Create a poll form ── Add option ──→ Same form + one focused field
        │
      Save
        │
        ▼
  Validate and create
        ├─ Invalid ──→ Same form + message + focus on first error
        └─ Valid ────→ Question heading + list in input order
```

## Companion artifacts

- `docs/mockups/2026-11-23-create-poll-form.html`: [Full-page mockup](../mockups/2026-11-23-create-poll-form.html).
## Planning review

Combined scope: this specification, the [plan](../plans/2026-11-23-issue-3-build-the-create-poll-form-plan.md), their inline visuals, and the linked mockup.

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
