# Help teammates create their first lunch poll — Issue #7

## Goal and approach

[Issue #7](https://github.com/rochecompaan/patchmill-test/issues/7) asks the form to explain what is missing and the empty state to show how to start. On the merged Issue #3 base, the form already reports a blank question or too few options. If two filled options accompany a blank extra row, the form saves without comment.

Extend the inline feedback that Issue #3 introduced. A separate error summary adds another stop before the user can fix the field. Native required-field messages cannot explain the option count or preserve the existing order of errors. The existing inline pattern gives the user one clear next action.

This change does not alter the architecture. `src/main.ts` owns the form and its errors. `src/poll.ts` retains its `createPoll` interface, normalization, minimum count, and snapshot rules. The browser form requires the user to resolve visible blank rows before it saves. The poll model still ignores blank input from callers. Team Lunch Poll remains the only context. This change needs no new domain term or module boundary.

## First use and correction

- Above the form, show **No lunch poll yet** and **Enter a question and at least two lunch options to create your first poll.** The form is the next step. Do not add a second create button.
- Show the form clean on first use. Keep **Add option**, **Save poll**, and the two initial option fields. Explain that the user can remove extra options.
- Give each added row a **Remove option** button with an accessible name that identifies its option number. The two initial fields cannot be removed. Keep existing labels and IDs stable after removal. Use the next unused number in this draft for the next row. On removal, focus **Add option** and clear current validation feedback.
- On save, treat text as blank after `trim()`. Show one error, in this order:

| Condition | Message | Focus |
| --- | --- | --- |
| The question is blank. | Enter a poll question. | Poll question |
| The question is not blank, but fewer than two options are not blank. | Enter at least two lunch options. | First blank option |
| At least two options are not blank, but a displayed option is blank. | Enter a lunch option. For an added row: Enter a lunch option or remove this field. | First blank option |

- Keep all values and rows on a failed save. The next save clears or replaces the previous error. **Add option** and **Remove option** do not submit the form.
- If no error remains, keep the existing save behavior. The saved poll replaces the first-use message and form. Focus the saved question. Keep option order and duplicate labels. Show user text literally.

## Frontend design

Frontend design applies because the change affects the first-use flow, visible feedback, and keyboard operation. Keep the existing left-aligned layout, Georgia masthead, and system sans-serif body. Use the existing plum `#3d2452`, lilac `#f2edf8`, mint `#e5f5eb`, ink `#20352c`, paper `#fffafc`, and rule `#49695a`. The existing style takes priority over a new visual direction. Use no motion. Keep the notices stacked below `40rem` and side by side at `40rem` and above.

Keep each error beside its input in the existing alert region. Mark the input with `aria-invalid` and associate the error via `aria-describedby`. Restore any previous description when the error clears. Keep visible keyboard focus. If the label, input, and error fit, reveal all three without counting the remove button. If they do not fit, give priority to the input and error. Keep initial controls disabled until the script attaches the handlers.

## Global constraints

- Use Node.js 24, npm 11, Vite, and vanilla TypeScript.
- Add no dependencies, network assets, backend, or storage.
- Keep the page shell, Results notice, and draft warning. Do not add voting, results, or edit-after-save behavior.

## Acceptance and verification

| Case | Expected result |
| --- | --- |
| Fresh page, including 320 CSS pixels | First-use copy leads into the form. No error appears. The page has no horizontal overflow. |
| Submit a whitespace question with blank options | The question error takes priority. Focus and error attributes identify the question. |
| Submit a filled question and one filled option | The minimum error identifies the first blank option. The draft stays intact. |
| Submit two filled options and one or more blank added rows | The form stays open. The first blank row gets its own error, not the minimum error. |
| Fill a blank extra row or remove it, then save valid input | Old feedback clears or moves to the next invalid input. After a valid save, the first-use copy and form disappear. |
| Add and remove rows by keyboard | Focus stays visible. Labels point to the correct inputs. Other values remain unchanged. |

Run these cases in a browser. Run the existing poll tests to protect the model contract.

## Visual explanation

```text
No poll → first-use guidance + form
                 │ Save
                 ├─ Blank question → question error
                 ├─ Fewer than two options → minimum error
                 ├─ Any blank row → fill it, or remove it if added
                 └─ Complete → saved question and options
```

## Companion artifacts

- `docs/mockups/2026-11-23-validation-empty-states.html`: [Full-page mockup](../mockups/2026-11-23-validation-empty-states.html).
## Planning review

Combined scope: this spec, the [plan](../plans/2026-11-23-issue-7-add-validation-empty-states-and-error-states-plan.md), both inline sketches, and the mockup. Both passes used `reviewer`, `openai-codex/gpt-6.2-sol`, thinking `xhigh`. Base: `2a130db24effd3b2c812ec2b082a817e07a721e1`.

### Initial pass

- Spec body SHA-256: `cc6fc55358dee9d9865dd6464fa01e2f76214300eee978de755216948ca3fce5`.
- Plan body SHA-256: `f9b7936806a189123d378050e576b0148c2c82ace71081799fddb58df1aad2f1`.
- Survey: `createPoll` owns normalization and the minimum count. The DOM owns validation feedback and the saved view. All seven existing model tests passed.
- B1 (blocker), **Accepted**: Specify and plan label, input, and error bounds without the remove button. Update the mockup and add a short-height check.
- S1 (suggestion), **Accepted**: Add keyboard addition and focus assertions to Task 2.
- S2 (suggestion), **Accepted**: Name the owning spec in the mockup.
- Limits: Static inspection, model tests, and synthetic scroll bounds. No live browser or build in the review.

### Scoped confirmation

- Reviewed and final spec body SHA-256: `f1e903e9569dad2284d75bbcd3c393213b857e9f920da88cd6db72781683c8dc`.
- Reviewed and final plan body SHA-256: `890ee4a03ebb817f797781db7df1866be4a1cfc1b9d4945a6c0c8455d7bb259c`.
- The reviewer confirmed the scroll design and matching mockup. B1 remains in the plan: its verification can pass with the old scroll helper. The plan records the evidence and next correction.
- Limits: The confirmation used synthetic scroll bounds and the existing model tests, not a live browser or build.
- Outcome: `blocked` at the combined boundary. Do not start implementation from this review record.
