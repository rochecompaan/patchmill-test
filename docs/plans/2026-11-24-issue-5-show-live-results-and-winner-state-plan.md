# Live Results and Winner State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the installed sibling `executing-plans` skill to execute this plan inline, task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show every option's vote count and the current leader or tie without a reload.

**Architecture:** The poll module derives counts and leading IDs from one snapshot. The browser shows those results in the existing notice after save and after each accepted vote.

**Tech Stack:** Node.js 24 LTS, npm 11, Vite, vanilla TypeScript, and Node's test runner.

**Spec:** [`docs/specs/2026-11-24-issue-5-show-live-results-and-winner-state-design.md`](../specs/2026-11-24-issue-5-show-live-results-and-winner-state-design.md)

## Global Constraints

- Use Node.js 24 LTS, npm 11, Vite, and vanilla TypeScript.
- Use no new dependencies, remote assets, backend, or persistent storage.
- Keep the existing one-vote guard, receipt, and page shell.

## Review Focus

| Condition | Regression check |
| --- | --- |
| The user acts again after voting. | Task 2 checks that the receipt and counts do not change. |
| Two options share a label. | Tasks 1 and 2 check that their IDs, ordinals, and counts stay distinct. |
| The poll ties before a later vote breaks the tie. | Tasks 1 and 2 check that no tie marker survives the change. |
| The poll contains stale vote IDs or no options. | Task 1 checks that neither case invents a leader. |
| A narrow screen has a long or HTML-like option label. | Task 2 checks wrapping, literal text, and receipt focus. |

---

## Inputs and file map

- Read the specification, including its inline visual explanation.
- Open the [full-page mockup](../mockups/2026-11-24-show-live-results-and-winner-state.html) for layout and states. Its fixture links are not product controls.
- Read [Issue #4's voting design](../specs/2026-11-23-issue-4-add-the-option-voting-flow-design.md) for the existing vote guard and focus rules.
- `src/poll.ts` derives counts and leading IDs. `tests/poll.test.ts` checks this contract.
- `index.html` owns the Results notice. `src/main.ts` updates it. `src/style.css` keeps the list readable on both layouts.
- `README.md` describes the new results and the unchanged vote limit.

## Task 1: Derive results from one poll snapshot

**Files:** `src/poll.ts`, `tests/poll.test.ts`.

**Interfaces:** Consume `countVotes(poll: Poll): readonly OptionVoteCount[]`. Export `getPollResults(poll: Poll): PollResults`. `PollResults` has `readonly counts: readonly OptionVoteCount[]` and `readonly leadingOptionIds: readonly string[]`.

- [ ] Import `getPollResults` in `tests/poll.test.ts`. Add these tests using the existing `poll`, `pizza`, and `otherPizza` fixtures:

```ts
test('shows zero counts and no leaders without counted votes', () => {
  assert.deepEqual(getPollResults({ ...poll, votes: [{ optionId: 'removed' }] }), {
    counts: [{ optionId: otherPizza.id, count: 0 }, { optionId: pizza.id, count: 0 }],
    leadingOptionIds: [],
  });
  assert.deepEqual(getPollResults({ ...poll, options: [] }), {
    counts: [], leadingOptionIds: [],
  });
});

test('reports top-count ties and recalculates after each accepted vote', () => {
  const third = { id: 'soup', label: 'Soup' };
  const snapshot = {
    ...poll,
    options: [...poll.options, third],
    votes: [...poll.votes, { optionId: otherPizza.id }, { optionId: otherPizza.id }],
  };
  const tied = {
    counts: [
      { optionId: otherPizza.id, count: 2 },
      { optionId: pizza.id, count: 2 },
      { optionId: third.id, count: 0 },
    ],
    leadingOptionIds: [otherPizza.id, pizza.id],
  };
  assert.deepEqual(getPollResults(snapshot), tied);
  const next = castVote(snapshot, pizza.id);
  if (!next.ok) assert.fail('expected another vote for the existing option');
  assert.deepEqual(getPollResults(next.poll), {
    counts: [tied.counts[0], { optionId: pizza.id, count: 3 }, tied.counts[2]],
    leadingOptionIds: [pizza.id],
  });
  assert.deepEqual(getPollResults(snapshot), tied);
});

test('does not treat a tie below the highest count as a poll tie', () => {
  const result = getPollResults({
    ...poll,
    options: [...poll.options, { id: 'soup', label: 'Soup' }],
    votes: [...poll.votes, { optionId: otherPizza.id }, { optionId: 'soup' }],
  });
  assert.deepEqual(result.leadingOptionIds, [pizza.id]);
});
```

- [ ] Run `node --test tests/poll.test.ts`. Expect a missing export error.
- [ ] Add the interface and function in `src/poll.ts`. Use `countVotes` once. Find the maximum with a loop seeded at zero. If the maximum is positive, collect every matching ID in option order. Do not change `countVotes` or `castVote`.
- [ ] Run `node --test tests/poll.test.ts`. Expect all tests to pass.
- [ ] Commit: `git add src/poll.ts tests/poll.test.ts && git commit -m "feat: derive poll results from recorded votes"`.

## Task 2: Show results in the existing notice

**Files:** `index.html`, `src/main.ts`, `src/style.css`, `README.md`.

**Interfaces:** Consume `getPollResults` from Task 1. Keep `renderResults(poll: Poll): void` private to `src/main.ts`. The browser interface is the Results notice and the existing poll actions.

- [ ] Add `id="results"` to the existing Results notice. Give its placeholder paragraph `id="results-summary"`. Add an empty `<ul id="results-counts" role="list" hidden></ul>` below the summary.
- [ ] Build `renderResults` with the spec's exact copy and markers. Map count rows to poll options by order, which the poll module preserves. Use a `Set` of leading IDs for membership. Replace the old list rows, show the list for a saved poll, and update the summary. Use `textContent` for option labels and summaries.
- [ ] Call `renderResults(poll)` after inserting the saved poll and before focusing its heading. Call `renderResults(currentPoll)` after a successful vote and before focusing the receipt. Add `aria-describedby="results-summary"` to the receipt. Keep rejected and repeat events on the existing paths that do not update the view.
- [ ] Scope the list styles to `#results`. Use the notice's existing placement and palette. Keep the count aligned where space permits. Let result rows and long labels wrap without horizontal overflow. Give only the sole leader a paper highlight.
- [ ] Replace the outdated README results sentence. Describe zero counts after save, per-option counts after a vote, and leader or tie as model outcomes. Do not suggest that this browser flow accepts multiple votes.
- [ ] Run `npm ci`, `npm run check`, and `node --test tests/poll.test.ts`. Expect a clean install, a successful type-check and build, and passing tests.
- [ ] Run `npm run dev`. At 320 and 1280 CSS pixels, check the no-poll notice before save. Save a poll with two `Tacos` labels and a long unbroken label that starts with `<b>`. Check input order, literal text, no horizontal scroll, zero counts, no markers, and focus on the question.
- [ ] Use the keyboard to vote for the second `Tacos`. Check `0 votes`, `1 vote`, `0 votes` in order and `Current leader: Option 2: Tacos.`. Check that only Option 2 carries `Leader`. Check disabled actions, visible receipt focus, and the receipt description in the accessibility inspector. Try activating another Vote button. Then use DevTools to dispatch a bubbling `click` on a disabled action. The results and receipt must not change. Reload and check that the placeholder returns.
- [ ] In browser DevTools **Sources**, set a breakpoint on `let currentPoll = poll` in `showPoll`. Save a fresh poll with three options. Pause before that line executes. While paused, run `poll = { ...poll, votes: [{ optionId: poll.options[0].id }, { optionId: poll.options[1].id }] }` in the selected `showPoll` frame. Resume. Check counts `1, 1, 0`, the tie summary, and two `Tied for lead` markers without a sole highlight. Vote for Option 2. Check counts `1, 2, 0`, no tie markers, and only the Option 2 lead. Do not add product fixtures, hooks, or extra vote actions.
- [ ] Commit: `git add index.html src/main.ts src/style.css README.md && git commit -m "feat: show live vote counts and the current leader"`.

## Verification choice

The Node tests pass the Testing Value Gate. They prove counts and lead rules on snapshots that the current browser cannot generate on its own. Browser checks use real keyboard, focus, responsive layout, and vote events. This repo has no browser test runner. Use direct browser verification for those checks rather than adding a dependency or testing markup strings. Inspect the mockup and documentation directly.

## Visual explanation

```text
Task 1: poll module + Node tests
        snapshot → ordered counts + leading IDs
                              │
                              ▼
Task 2: browser notice ← save / successful vote
        document behavior → build + browser checks
```
## Planning review

Combined scope: this plan, the [design](../specs/2026-11-24-issue-5-show-live-results-and-winner-state-design.md), their inline visuals, and the linked mockup. Both passes used `reviewer`, `openai-codex/gpt-6.2-sol`, thinking `xhigh`. Base: `45b4e1fd100747fb07ecd03b7a550f13b30a24b8`.

**Initial pass.** Plan body SHA-256: `cce373b936a509746f0beae484e430d5abd71d456b61f76f3231994dea3094ab`. Compared design body SHA-256: `33354080b0504263ecc10cbef315af38dd9dacfd80346c35f9a28f5f6833667f`.

The reviewer traced how `countVotes` preserves order and how `showPoll` updates its snapshot. The reviewer found no blockers. Nine base tests passed. An in-memory probe showed the planned tests fail without the new export and pass with a trial implementation.

- S1, **Accepted**: Named the owning design in the mockup.
- S2, **Accepted**: Named browser DevTools Sources and the exact breakpoint in Task 2.

**Scoped confirmation.** The reviewer confirmed both changes and traced how the seeded snapshot reaches the vote handler. An in-process probe confirmed the change from `1, 1, 0` to `1, 2, 0`. The reviews did not run a browser or build. Those production checks remain in Task 2.

Final plan body SHA-256: `2332a51d09b2f5fa6f02b34a17579be130a5a94833d11796db8aaf5281a7e202`. Compared final design body SHA-256: `33354080b0504263ecc10cbef315af38dd9dacfd80346c35f9a28f5f6833667f`. Outcome: `ready`.
