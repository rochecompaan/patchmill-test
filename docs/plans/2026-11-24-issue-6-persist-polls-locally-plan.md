# Persist Polls Locally Implementation Plan

> **For agentic workers:** Use [executing-plans](../../.patchmill/skills/executing-plans/SKILL.md) for inline execution in the kernel implementation session. Follow the steps in order.

**Goal:** Keep the current poll and its vote after refresh. Let the user reset both.

**Architecture:** The poll module remains pure. A storage module reads and writes one snapshot. The page owns the active snapshot, focus, and the choice of view.

**Tech Stack:** Node.js 24, npm 11, Vite, vanilla TypeScript, Web Storage.

**Spec:** [Issue #6 design](../specs/2026-11-24-issue-6-persist-polls-locally-design.md).

**Other inputs:** The spec's inline state diagram, [reset mockup](../mockups/2026-11-24-persist-polls-locally.html), and [Issue #4 voting flow](../specs/2026-11-23-issue-4-add-the-option-voting-flow-design.md) for existing interaction. Issue #6 replaces Issue #4's refresh behavior.

## Global constraints

- No new dependencies, backend, remote assets, drafts, history, voter identity, results changes, migrations, or cross-tab coordination.
- One poll under `team-lunch-poll:v1`. The demo accepts one vote across refreshes. The domain model does not acquire that limit.
- Keep the existing page shell and `40rem` workspace breakpoint. Use the spec's copy and focus rules. Controls stay at least `2.75rem` high.
- At implementation setup, run `npm ci`. Expected: the locked dependencies install without changes to the manifest or lockfile.

## File map

- `src/poll-storage.ts` and `tests/poll-storage.test.ts`: storage interface and behavior tests.
- `index.html`: persistent status region and the create and saved view containers.
- `src/main.ts`: startup, snapshot ownership, rendering, and reset flow.
- `src/style.css`: secondary reset control, confirmation, status, focus, and wrapping.

## Review focus

- Invalid data with plausible JSON: Task 1 rejects a duplicate ID, a stale vote, and a second vote.
- Storage access can throw during startup: Task 1 tests a throwing accessor. Task 2 verifies that the create form remains usable.
- When a write or removal throws, the UI must not report success: Task 2 checks both in a browser.
- Duplicate labels must not confuse vote restoration: Task 2 uses the second of two identical labels.
- Repeated create and reset must not leave stale fields or event handlers: Task 2 completes two cycles without reload.

### Task 1: Store and validate one poll snapshot

**Files:** Create `src/poll-storage.ts` and `tests/poll-storage.test.ts`.

**Interfaces:** Consumes `Poll` from `src/poll.ts`. Produces `createPollStore(getStorage: () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>): PollStore`. The `PollStore` interface has `load(): LoadResult`, `save(poll: Poll): boolean`, and `clear(): boolean`. `LoadResult` is a union with `kind: 'loaded'` and `poll: Poll`, or a separate variant for each of `kind: 'empty'`, `kind: 'invalid'`, and `kind: 'unavailable'`.

- [ ] **Write behavior tests.** Use `node:test` and `node:assert/strict`. Use a map adapter with real missing-key behavior. Import `../src/poll-storage.ts` as in the existing Node suite. Set `key` to `team-lunch-poll:v1` in test fixtures, not in the public interface. Use a `poll` with question `Lunch?`, two `Pizza` labels with IDs `option-9` and `option-3` in that order, and a vote for `option-3`.

| Test name | Assertions |
| --- | --- |
| Empty and round trip | `assert.deepEqual(store.load(), {kind: 'empty'})`. For snapshots with zero votes and with the vote fixture, `assert.equal(store.save(snapshot), true)` and `assert.deepEqual(newStore.load(), {kind: 'loaded', poll: snapshot})`. Both stores use the same map. |
| Invalid data does not erase the key | Seed `{` as raw text. Then try JSON for `null`, a blank question, a blank label, an empty ID, fewer than two options, duplicate IDs, a non-array `votes`, an option ID with a different case, and two otherwise valid votes. For each, `assert.deepEqual(store.load(), {kind: 'invalid'})` and `assert.equal(map.get(key), raw)`. |
| Reset removes only the poll | Seed the valid snapshot and an `unrelated` entry. `assert.equal(store.clear(), true)`, `assert.deepEqual(store.load(), {kind: 'empty'})`, and `assert.equal(map.get('unrelated'), 'keep')`. Run clear again and expect `true`. |
| Storage can throw | First inject an accessor that throws. Then inject an adapter with each method throwing. For both, `assert.deepEqual(store.load(), {kind: 'unavailable'})`, `assert.equal(store.save(poll), false)`, and `assert.equal(store.clear(), false)`. |

- [ ] **Run the red test.** Run `node --test tests/poll-storage.test.ts`. Expected: failure because `src/poll-storage.ts` does not exist.
- [ ] **Implement the store.** Keep the key, parsing, and validation private. Parse to `unknown`. Narrow each object, array, and field before use. Use a set for exact ID membership and uniqueness. Apply the spec's validation without renumbering options. Separate storage exceptions from JSON and shape errors. Do not write or clean up on read.
- [ ] **Run the suite.** Run `node --test tests/*.test.ts && npm run check`. Expected: all tests pass and TypeScript and Vite exit zero.
- [ ] **Commit Task 1.** Stage both files. Commit as `feat: store the current poll snapshot`.

### Task 2: Restore, save, and reset from the poll workspace

**Files:** Modify `index.html`, `src/main.ts`, and `src/style.css`.

**Interfaces:** Consumes Task 1's `PollStore` operations and `createPoll` and `castVote` from `src/poll.ts`. Produces the user-facing poll lifecycle through the existing workspace controls.

- [ ] **Reproduce the gap in a browser.** Run `npm run dev -- --host 127.0.0.1`. Expected: Vite prints a local URL. Save a poll and refresh at that URL. Expected on the base: the create form returns and no reset action exists.
- [ ] **Keep both views under `#creation`.** Wrap the existing create heading and form in their own panel. Add a hidden saved panel and a persistent status element with `role="status"` outside both. Leave the Results notice intact. Attach the form listeners once.
- [ ] **Wire startup and snapshot transitions.** Instantiate the store with `() => window.localStorage`. Keep one `Poll | undefined` in `src/main.ts`. Load before choosing the view. Do not save on startup. For valid create or vote results, adopt the snapshot and save it before updating the view. Ignore clicks from stale views and guard against a second vote with the active snapshot. Derive receipt, marker, and disabled states from `poll.votes[0]?.optionId` in the saved view. Focus the heading on create and the receipt on vote, but neither on restore. Use `textContent` for poll strings. Apply the spec's storage messages.
- [ ] **Wire reset and focus.** Add the secondary opener and an inline confirmation group in the saved panel. Follow the spec's focus and clear ordering. On success, hide and empty the saved panel. Restore the retained form with `form.reset()`. Remove option rows after the initial two, clear error text and input attributes, and remove the draft `beforeunload` handler. Remove the saved-view class before showing the form. Focus the question input. Adjust CSS so enabled Vote controls remain primary and the reset controls stay secondary.
- [ ] **Verify in a fresh browser profile.** Run these cases at the Vite URL. Start with no poll key. Use DevTools only on this demo origin.
  1. Create a poll after adding a third field. Use two matching `Pizza` labels and a long third label. Refresh. Expect the same question and ordered options with all Vote controls enabled.
  2. Vote for the second `Pizza`. Expect the second marker, receipt focus, and all Vote controls disabled. Refresh. Expect the same receipt and marker, disabled controls, and no forced focus. Try repeated activation. Expect no change.
  3. Use the keyboard to open and cancel reset. Expect Cancel focus on open and opener focus on cancel. Confirm reset. Expect a blank form with two options and question focus. Refresh and verify that the poll key remains absent and an unrelated seeded key remains unchanged. Create, vote, and reset twice without refresh. Verify that draft warnings occur only for nonblank drafts.
  4. Seed invalid raw JSON under the poll key and refresh. Expect the create form and invalid-data message. Create a valid poll and refresh. Expect the poll and no warning. For failure probes, temporarily override the current page's `Storage.prototype.setItem` or `removeItem` to throw for the poll key. Restore the original method after each probe. Expect a failed save to retain the in-memory poll or vote with the warning. Expect a failed reset to retain the poll and confirmation. Retry with storage restored and expect success.
  5. Set a DevTools breakpoint on the startup `store.load()` call and refresh. While paused, replace `Storage.prototype.getItem` with a function that throws. Resume. Expect the create form and `Browser storage is unavailable. A refresh may lose this poll.` Create a poll and expect the saved view. Remove the breakpoint and reload to restore the method.
  6. At 320 and 1280 CSS pixels, verify wrapping, no horizontal scroll, visible keyboard focus, and an unchanged Results notice. Capture the implementation evidence required by the kernel.
- [ ] **Run the suite.** Run `node --test tests/*.test.ts && npm run check`. Expected: all tests pass and TypeScript and Vite exit zero.
- [ ] **Commit Task 2.** Stage `index.html`, `src/main.ts`, `src/style.css`, and any required implementation evidence. Commit as `feat: restore and reset the current poll`.

The storage tests protect data and error behavior. The browser checks cover wiring, refresh, and focus with actual Web Storage. No test asserts document text or file structure.

## Visual explanation

```text
1. Storage module + Node tests
       │ load / save / clear interface
       ▼
2. Workspace lifecycle + real browser checks
       │ create → refresh → vote → refresh → reset → create
       │ inaccessible storage → warning + usable form
       ▼
   Whole-branch implementation review
```
## Planning review

Combined scope: this plan, the [design](../specs/2026-11-24-issue-6-persist-polls-locally-design.md), both inline visuals, and the mockup. Both passes used fresh `reviewer` sessions with `openai-codex/gpt-6.2-sol`, thinking `xhigh`. Base: `45b4e1fd100747fb07ecd03b7a550f13b30a24b8`.

**Initial pass.** Design body: `cddc0e3b8362f332e1814efac9e13fd9c733f1f97662745b3a43647910dcd4c7`. Plan body: `4d9866aab4ec4858f209c38250731535e43d25571cfce0ddcfbbb503e39cf7d4`. The reviewer checked task order and the new store interface against the design and base tests. The page retains ownership of focus and the active poll.

- B1, **Accepted**: Added a startup `getItem` error probe to Task 2. It checks the exact warning and that the create form works. The plan visual and review focus now reflect this check.
- S1, **Accepted**: Changed Task 1's fixture to `option-9` before `option-3`. Full equality catches ID regeneration, reordering, and vote reassignment.
- S2, **Accepted**: Named the owning design in the mockup metadata.

**Scoped confirmation.** The reviewer verified all three corrections and found no remaining blockers. All nine base Node tests passed. The reviewer inspected the mockup and links statically. The planner inspected the offline mockup at 320 and 1280 pixels. The build and browser persistence probes remain implementation checks.

Final design body: `cddc0e3b8362f332e1814efac9e13fd9c733f1f97662745b3a43647910dcd4c7`. Final plan body: `8f4203f01a02605573020377d0d10e625aba9638cd3aeb8e4f95208e17d735e2`. Outcome: `ready`.
