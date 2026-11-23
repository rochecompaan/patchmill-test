# Option Voting Implementation Plan

> **For agentic workers:** Use the installed `.patchmill/skills/executing-plans/SKILL.md` for inline execution. Steps use checkboxes for tracking.

**Goal:** Let a teammate vote once for one option in the saved poll and see which option received the vote.

**Architecture:** The poll module validates the option ID and returns a new snapshot with the appended vote. The existing saved view owns the snapshot and the per-view vote guard.

**Tech Stack:** Node.js 24 LTS, npm 11, TypeScript, Vite, native browser DOM, and `node:test`.

**Spec:** [Issue #4 design](../specs/2026-11-23-issue-4-add-the-option-voting-flow-design.md).

## Inputs

- The Issue #4 design, including its inline visual explanation.
- [Interactive saved poll mockup](../mockups/2026-11-23-add-the-option-voting-flow.html).
- [Issue #2 model](../specs/2026-11-23-issue-2-define-the-poll-option-and-vote-data-model-design.md) and [Issue #3 create flow](../specs/2026-11-23-issue-3-build-the-create-poll-form-design.md), including their inline diagrams.

## Global constraints

- Use Node.js 24 LTS, npm 11, Vite, and vanilla TypeScript.
- Use no new dependencies, remote assets, backend, or persistent storage.
- Keep the existing Results notice and page shell.

## File responsibilities

- `src/poll.ts`: Snapshot operation and option membership rules.
- `tests/poll.test.ts`: Vote operation tests at the poll interface.
- `src/main.ts`: Extend `showPoll` with vote actions, a per-view guard, and confirmation.
- `src/style.css`: Saved view rows, action states, and confirmation focus.
- `README.md`: Explain casting one vote in the local poll and the existing reload behavior.

## Review focus

- Duplicate labels must not merge choices (Tasks 1 and 2).
- Rapid activation must not select a second option (Task 2).
- An ID not present in the current poll must not add a vote (Task 1).
- Untrusted label text must stay literal in names and the receipt (Task 2).
- Narrow screens and long labels must not hide the action (Task 2).

### Task 1: Record a vote in the poll snapshot

**Files:** Modify `src/poll.ts` and `tests/poll.test.ts`.

**Interfaces:** Consume the existing `Poll` and `Vote` types. Export `castVote(poll: Poll, optionId: string): CastVoteResult`. Export `CastVoteResult` as `{ ok: true; poll: Poll } | { ok: false; reason: 'unknown-option' }`.

- [ ] Add these tests to `tests/poll.test.ts`. Import `castVote` alongside the existing imports. The `poll` fixture has two options labeled Pizza and existing votes for only one of those options.

```ts
test('appends a vote by exact ID without changing the input', () => {
  const before = structuredClone(poll);
  const result = castVote(poll, pizza.id);
  assert.deepEqual(result, {
    ok: true,
    poll: { ...before, votes: [...before.votes, { optionId: pizza.id }] },
  });
  if (!result.ok) assert.fail('expected a vote');
  assert.notStrictEqual(result.poll, poll);
  assert.notStrictEqual(result.poll.votes, poll.votes);
  assert.deepEqual(poll, before);
});

test('rejects an unknown option without changing the input', () => {
  const before = structuredClone(poll);
  for (const id of ['removed', '__PROTO__']) {
    assert.deepEqual(castVote(poll, id), { ok: false, reason: 'unknown-option' });
  }
  assert.deepEqual(poll, before);
});
```

- [ ] Add a typed temporary stub that returns `{ ok: true, poll }` for any ID. Run `node --test tests/poll.test.ts`. Expect both new tests to fail at assertions and all existing tests to pass.
- [ ] Replace the stub with the specified operation. Match an option by exact ID. Append to a fresh votes array in a fresh snapshot. Keep `countVotes` and `createPoll` unchanged.
- [ ] Run `node --test tests/poll.test.ts`. Expect zero failures.
- [ ] Commit `src/poll.ts` and `tests/poll.test.ts` as `feat: record a vote in the poll snapshot`.

### Task 2: Vote from the saved view

**Files:** Modify `src/main.ts`, `src/style.css`, and `README.md`.

**Interfaces:** Consume `castVote` from Task 1. Keep `showPoll(poll: Poll)` private. The browser interface is the saved poll shown after **Save poll**. No new exported interface is necessary.

- [ ] Run `npm ci` and `npm run dev`. Expect installation from the lockfile and a local Vite URL. Before editing, save a poll with two options named `Tacos`. Observe that neither row has a Vote button. This is the browser RED case.
- [ ] In `showPoll`, keep a `currentPoll: Poll` and `selectedOptionId: string | undefined` local to the view. Keep the question heading and its initial focus. Build each row in option order with `Option N`, the literal label, and a native `type="button"` action. Use **Vote** and `aria-label="Vote for option N: LABEL"`. Keep the option ID in the click closure.
- [ ] Add a hidden confirmation paragraph above the list with `tabIndex = -1`. On activation, return before `castVote` if `selectedOptionId` is set. Call `castVote(currentPoll, optionId)`. Return on rejection. On success, assign the new poll and set the selected ID before any UI change. Disable all vote actions. Mark only the chosen row with **Your vote** and show `You voted for option N: LABEL.`. Focus the confirmation. Set user-provided text through `textContent` or attribute APIs, never HTML.
- [ ] Scope voting styles to the saved view. Keep the shell and Results notice intact. Use plum actions, visible focus, text for the row marker, and `2.75rem` minimum action height. Let rows wrap. Check that CSS does not remove list semantics. Do not add motion.
- [ ] In `README.md`, describe the Vote action and one vote per poll in the current page. Preserve the note that reload clears the poll and results are not available yet.
- [ ] Repeat the browser RED case. Save with two `Tacos` labels and an extra long label containing `<b>`. At 320 and 1280 CSS pixels, verify distinct visible ordinals, matching accessible names, literal text, and no horizontal scroll. Verify focus starts on the question and Tab reaches the first then the second action. Activate the second with Space or Enter. Verify the exact `You voted for option 2: Tacos.` receipt, focus on it, one marker in row 2, disabled actions, and unchanged Results notice.
- [ ] In a fresh poll, double-click a Vote action and try another action after the vote. Verify that the receipt and sole marker do not change. In DevTools, select a different disabled Vote button in Elements. Run `$0.dispatchEvent(new MouseEvent('click', { bubbles: true }))` in the console. Verify that the receipt and sole marker still do not change. Inspect that the guard runs before `castVote` even when an event bypasses the disabled control. Reload, verify the form returns, save again, and vote for the markup-like label. Verify the receipt shows `<b>` literally. Verify that blank form submissions and Add option still behave as before.
- [ ] Run `node --test tests/poll.test.ts` and `npm run check`. Expect zero test failures and a successful type check and production build. Direct browser checks cover focus, layout, and activation without a new DOM test dependency. Node tests cover data behavior, not markup or configuration.
- [ ] Capture browser evidence of the ready and voted views in `docs/screenshots/vote-options.png` and `docs/screenshots/vote-confirmation.png`, using the installed `patchmill-visual-evidence` skill. Verify the screenshots show the actual compiled behavior, not the mockup.
- [ ] Commit the changed UI, README, and screenshots as `feat: let a teammate vote for one lunch option`.

## Visual explanation

```text
1  poll.ts + poll.test.ts   → validate ID and append one vote
                             │ consume castVote
                             ▼
2  main.ts + style.css      → saved view, per-view guard, confirmation
   README + screenshots     → usage and browser evidence after checks
```

## Planning review

Combined scope: this plan, the [design](../specs/2026-11-23-issue-4-add-the-option-voting-flow-design.md), their inline visuals, and the linked mockup. Both passes used `reviewer`, `openai-codex/gpt-6.2-sol`, thinking `xhigh`. Base: `2a130db24effd3b2c812ec2b082a817e07a721e1`.

**Initial pass.** Design body: `db9ade907cbe666fed4a48705244fc4e9755861c2dfa21172979968613d3e6c7`. Plan body: `c3f77426ece662d8b00b5c3fb9f84e2f1e7874818fe3f5d73f08487c7907596b`.

The reviewer verified that `src/poll.ts` owns snapshot rules and `showPoll` owns the saved view. Task 1 and Task 2 follow that split. The reviewer found no blockers and made three suggestions:

- S1, **Accepted**: Task 1 now tests the second duplicate label with prior votes and rejects an unknown ID and a wrong-case ID.
- S2, **Accepted**: Task 2 now includes a synthetic activation of a different disabled action and verifies that the receipt and sole marker stay unchanged.
- S3, **Accepted**: The mockup now names its owning design file.

**Scoped confirmation.** The reviewer confirmed all three changes. All seven base Node tests passed. In-memory probes exercised the proposed assertions against representative implementations. The reviewer did not run a browser or production build. The planner verified the mockup offline at 320 and 1280 pixels.

Final design body: `db9ade907cbe666fed4a48705244fc4e9755861c2dfa21172979968613d3e6c7`. Final plan body: `b3ef0ff6e327eef4ed17060b1335181a7c5bfddf643839f8912330eb21f9bd76`. Outcome: `ready`.
