# Add the option voting flow — Issue #4

[Issue #4](https://github.com/rochecompaan/patchmill-test/issues/4) lets a teammate cast one vote in the current poll. The saved view from Issue #3 is the entry point. Today `showPoll` in `src/main.ts` replaces the form with a question and a plain list. `src/poll.ts` creates a poll with no votes and counts votes by option ID.

## Scope and approaches

Use one immediate **Vote** action per option. A separate selection and submit step reduces misclicks, but adds a step the issue does not require. The first successful vote is final in this view. An in-memory guard prevents another vote without adding voter identity or storage. A storage-backed lock needs a persistent poll identity and is premature: a reload currently discards the poll, and Issue #6 owns persistence.

Here, “same browser session” means the lifetime of this saved poll in the current page. Reload returns to the create form, not to an unlocked copy of the same poll. A new poll can accept its own vote even when option IDs repeat. There is no cross-tab coordination, vote change, undo, tally display, or persistent storage.

This adds an operation to the existing poll module, not a new module or domain relationship. Team Lunch Poll remains the only context. `GLOSSARY.md` still defines a vote as a selection, not a voter record or a count. Two matching labels can describe distinct options. The browser guard does not limit how many votes a `Poll` can contain. No glossary change or ADR is needed.

## User flow and frontend design

Frontend design applies because this issue changes browser controls, focus, and feedback. Keep the existing plum, lilac, mint, paper, and ink palette, Georgia title, and system sans-serif body. The existing page design takes priority over a new visual style. Keep the Results notice unchanged and keep the workspace breakpoint at `40rem`.

- After save, focus the question heading as before. Show the options in input order with a visible `Option N` ordinal and the option label. Use a native **Vote** button for each row. Give it an accessible name of the form `Vote for option 2: Tacos`. No action submits a form.
- Use the ordinal to distinguish identical labels. On the first successful vote, show `You voted for option 2: Tacos.` for that option. Show **Your vote** in its row. Disable every Vote button, including the selected row's button. Move focus to the visible confirmation above the list, without adding it to the tab order. A second activation does not change the view or vote.
- Keep labels and confirmation text literal. Use a clear focus outline, targets at least `2.75rem` high, and text to identify the selected row without color. Keep each action next to its label where space permits. Allow rows to wrap and long labels to break on narrow screens. No motion is needed.

## Module interface

Add `castVote(poll: Poll, optionId: string): CastVoteResult` to `src/poll.ts`. It takes a valid `Poll` snapshot with unique option IDs. An ID must match an option in that poll exactly. An unknown ID returns `{ ok: false, reason: 'unknown-option' }` without changing the poll or throwing.

Success returns `{ ok: true, poll: Poll }` with a fresh snapshot and votes array. The new vote is `{ optionId }` at the end of the array. The question, option order, and existing votes stay unchanged. The operation accepts votes even if the snapshot already contains votes. It scans the options and copies the votes on success. Time is linear in options plus votes on success, and extra space is proportional to the votes. It has no I/O or configuration. `createPoll` and `countVotes` stay unchanged.

The interface hides membership and immutable append rules. Its depth gives callers leverage: they pass the current snapshot and ID, not a partly updated poll. This keeps vote validity local to the poll module. `src/main.ts` calls the same pure interface as Node tests. No adapters or injected services are necessary for in-process computation.

`showPoll` owns the current snapshot and the selected option ID for this view. It binds each action to its option ID, not its label or list position. The click handler checks the selected ID before calling `castVote`. On success it updates the snapshot and sets the selected ID synchronously before changing the UI. On rejection it leaves the poll and UI unchanged. Selection and DOM references stay private. The browser's interface is the saved view and its controls. Use the real browser at that seam, not a test-only interface or fake DOM adapter.

## Global constraints

- Use Node.js 24 LTS, npm 11, Vite, and vanilla TypeScript.
- Use no new dependencies, remote assets, backend, or persistent storage.
- Keep the existing Results notice and page shell.

## Acceptance and verification

| Behavior | Verification |
| --- | --- |
| Each saved option has a vote action. | In a browser save a poll with duplicate labels and a long label. Check order, distinct ordinals, accessible names, keyboard focus, and no horizontal scroll at 320 and 1280 CSS pixels. |
| One vote names the exact option. | Test ID matching, append order, immutability, and unknown IDs through `castVote`. In the browser select the second of two identical labels. Check its receipt, marker, and receipt focus. |
| The same poll does not accept a second vote in the view. | Check that every action is disabled. Try rapid or repeated activation. Inspect that the synchronous guard runs before `castVote`. Reload and check that only a new poll can accept a vote. |

## Visual explanation

```text
Save poll → Question + one Vote action per option
                       │ first valid activation
                       ▼
            Append vote for the option ID
                       │
                       ▼
            Focus receipt + mark row + lock actions
                       │ repeat activation
                       └─→ No change
```

## Companion artifacts

- `docs/mockups/2026-11-23-add-the-option-voting-flow.html`: [Interactive saved poll mockup](../mockups/2026-11-23-add-the-option-voting-flow.html).

## Planning review

Combined scope: this design, the [plan](../plans/2026-11-23-issue-4-add-the-option-voting-flow-plan.md), their inline visuals, and the linked mockup. Both passes used `reviewer`, `openai-codex/gpt-6.2-sol`, thinking `xhigh`. Base: `2a130db24effd3b2c812ec2b082a817e07a721e1`.

**Initial pass.** Design body: `db9ade907cbe666fed4a48705244fc4e9755861c2dfa21172979968613d3e6c7`. Plan body: `c3f77426ece662d8b00b5c3fb9f84e2f1e7874818fe3f5d73f08487c7907596b`.

The reviewer found that `createPoll` and `countVotes` use poll-local IDs. The saved view is private to the page. The reviewer found no blockers and made three suggestions:

- S1, **Accepted**: Tightened Task 1 tests for duplicate labels, prior votes, poll membership, and exact ID matching.
- S2, **Accepted**: Added a browser probe to exercise the guard past a disabled action.
- S3, **Accepted**: Named the design file in the mockup.

**Scoped confirmation.** The reviewer confirmed S1–S3 and did not find remaining blockers. The seven base tests passed. The reviewer used static inspection and in-memory test probes. The planner inspected the offline mockup at 320 and 1280 pixels. Production browser behavior and the build remain implementation checks.

Final design body: `db9ade907cbe666fed4a48705244fc4e9755861c2dfa21172979968613d3e6c7`. Final plan body: `b3ef0ff6e327eef4ed17060b1335181a7c5bfddf643839f8912330eb21f9bd76`. Outcome: `ready`.
