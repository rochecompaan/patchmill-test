# Persist Polls Locally Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the installed `executing-plans` skill for inline execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the current poll and all votes after refresh, with a deliberate reset action.

**Architecture:** A browser-independent storage module hides JSON validation and Storage errors. The existing application state owner loads before rendering and saves accepted transitions. Reset clears storage before memory.

**Tech Stack:** TypeScript, Vite, browser localStorage, Node 24 `node:test`, npm 11.

**Spec:** [Persist polls locally](../specs/2026-11-20-issue-6-persist-polls-locally-design.md).

## Global Constraints

- Use the single key `team-lunch-poll.current`, with JSON `{ "version": 1, "poll": <Poll> }`.
- Never call `localStorage.clear()`.
- Do not store derived vote counts.
- All operations are synchronous. Storage exceptions never escape this interface.
- Loading never overwrites or removes data, including unknown versions.
- Do not debounce, wait for unload, or save only a selected option or count.
- One active tab is supported. Concurrent tabs use last successful write wins and can overwrite each other.
- Do not merge branches, replace other issue work, or build the missing flows under this issue.
- No animation is required.

## Inputs and dependency checkpoint

Read the specification, including its inline visual explanation, and [the full-page mockup](../mockups/2026-11-20-persist-polls-locally.html).
Also read `GLOSSARY.md`, `PROJECT_BRIEF.md`, `src/domain/poll.ts`, and the creation/voting issue requirements.
The inspected base is `7307d6f08264befe63aa55850ab2f98f83afe2ee`.
At this base, `src/main.ts` only imports CSS. Creation and voting integration do not exist.

- [ ] Before product changes, inspect the authorized implementation branch for the completed creation and voting flows.
- [ ] Identify their exact current-poll owner, render function, creation handler, vote handler, and same-session guard.
- [ ] If either flow remains absent, stop and ask the maintainer for sequencing guidance. Do not deliver a disconnected module as completion.
- [ ] If their contracts conflict with this spec, stop and ask before changing scope.
- [ ] Replace the dependency-dependent file locations in Task 2 with inspected paths and symbols. Record the new base revision.
- [ ] Renew Planning review for material plan changes before implementation. Do not silently apply this plan to incompatible code.

This checkpoint is a real implementation dependency, not a claim that these flows exist today.
No new worktree or branch is required. Use the issue run's authorized workspace.

## File responsibilities

- Create `src/persistence/poll-storage.ts`: serialization, shape validation, storage access, and classified results.
- Create `tests/poll-storage.test.mjs`: interface behavior with a stateful Storage adapter and throwing variants.
- Modify `src/main.ts`: composition root only, if it remains the dependency's entry point.
- Modify the inspected current-poll owner and view files from the checkpoint: startup hydration, transition saves, feedback, and reset.
- Modify `src/style.css` and `index.html` only where the actual rendering architecture needs reset and feedback support.
- Add `tests/poll-persistence-integration.test.mjs` at the existing application's observable state interface, if that interface supports Node tests.
- If application behavior exists only through DOM events, use the dependency's browser harness for those cases instead. Do not expose private seams for tests.
- Update `README.md`: storage lifetime, one-tab limitation, and reset instructions.

Keep validation helpers private to the persistence module. Avoid an unrelated state-owner refactor.

## Review Focus

- Unsupported or corrupted storage must not overwrite data merely because startup runs. Task 1 verifies no writes or removals.
- A throwing localStorage getter must not prevent startup. Task 1 verifies guarded acquisition and recovery.
- A failed reset must not show an empty screen while old data remains. Task 2 verifies retained poll, votes, and guard.
- An accepted vote must persist before a refresh. Task 2 verifies restore after the real vote action.
- HTML-like saved strings must remain inert text. Task 2 verifies safe rendering and keyboard access in the browser.

---

## Task 1: Implement the storage interface and recovery contract

**Files:**
- Create: `src/persistence/poll-storage.ts`.
- Create: `tests/poll-storage.test.mjs`.
- Read without modification: `src/domain/poll.ts`, `tests/poll.test.mjs`.

**Interfaces:**
- Consumes: `Poll` from `src/domain/poll.ts`.
- Produces: `StoragePort`, `LoadResult`, `WriteResult`, `PollStorage`, and `createPollStorage(getStorage: () => StoragePort): PollStorage`, exactly as specified.
- `load(): LoadResult`, `save(poll: Poll): WriteResult`, and `clear(): WriteResult` are the only store operations.

- [ ] **Step 1: Write failing interface tests.** Use `node:test` and `assert/strict`, following `tests/poll.test.mjs`.

Create a fresh in-memory adapter per test. Its Map represents actual persisted strings, not canned `load` return values.
Record calls to prove startup performs reads only and reset touches only the owned key.
Use this fixture:

```js
const poll = {
  id: 'lunch', question: 'Soup or wraps?',
  options: [{ id: '__proto__', label: 'Soup' }, { id: 'wrap', label: 'Wrap' }],
  votes: [{ optionId: 'wrap' }, { optionId: 'wrap' }],
};
```

Add these named cases and assertions:

| Test | Required assertions |
| --- | --- |
| `round trip retains complete poll` | `save(poll)` equals `{status:'ok'}`. A fresh store with the same adapter loads `{status:'loaded',poll}`. The raw record has version 1 and the complete poll. |
| `missing key is empty without writes` | `load()` equals `{status:'empty',poll:null}`. No writes or removals occur. |
| `invalid records are not partially restored or rewritten` | Parameterize malformed JSON, null, arrays, missing fields, version 2, wrong field types, duplicate IDs, blank IDs, and dangling votes. Each returns `{status:'invalid',poll:null}` and preserves the raw record. |
| `model-valid edge states survive` | Empty option/vote arrays, empty question/labels, duplicate labels, opaque IDs, repeated votes, and reordered options round trip unchanged. |
| `extra fields are excluded` | Load a valid envelope with extra fields at every object level. Assert only documented domain fields survive. |
| `getter and operation errors are contained` | Throw separately from the getter, getItem, setItem, and removeItem. Assert unavailable results and no thrown exceptions. |
| `later operations retry storage` | Fail one getter or write, restore the adapter, then assert a later save succeeds and a fresh store restores the full latest poll. |
| `clear preserves unrelated keys` | Seed the owned record and another key. Clear returns ok, fresh load returns empty, and the other key remains exact. |
| `failed save and clear preserve prior record` | Seed a valid old record. Throw before adapter mutation. Assert unavailable and unchanged stored content. |
| `save leaves frozen caller data unchanged` | Deep-freeze the fixture. Assert successful save and identical caller data. |

- [ ] **Step 2: Run `node --test tests/poll-storage.test.mjs`.** Expect failure because the module does not exist.
- [ ] **Step 3: Implement the exact specified interface.** Guard getter acquisition and each Storage call. Keep the validator private.

Validate unknown JSON with explicit object, array, and primitive checks before field access.
Use a Set for unique option IDs and reference membership. Reconstruct only known fields after validation.
Save a full envelope in one `setItem`. Clear with one `removeItem`. Return unavailable on Storage errors.
Do not access browser globals at import time. Do not add runtime form restrictions to the domain model.

- [ ] **Step 4: Run `node --test tests/poll.test.mjs tests/poll-storage.test.mjs`.** Expect all cases to pass.
- [ ] **Step 5: Run `npm run check`.** Expect a clean strict TypeScript check.
- [ ] **Step 6: Commit the module and its tests.** Use `feat: persist complete polls with safe storage recovery`.

## Task 2: Connect startup, accepted changes, feedback, and reset

**Files:** The exact state-owner and view paths come from the mandatory checkpoint, not invented handlers.
Create or extend the application's integration tests, plus `tests/poll-persistence-integration.test.mjs` only when its existing interface supports Node execution.
Modify `README.md` and the necessary view styles.

**Interfaces:**
- Consumes: Task 1's `PollStorage`, `LoadResult`, and `WriteResult`.
- Consumes: the inspected creation, voting, current-poll, and same-session guard interfaces.
- Produces: browser-visible hydration, accepted-change persistence, storage feedback, and confirmed reset.
- Construct production storage with `createPollStorage(() => window.localStorage)` at the composition root.

- [ ] **Step 1: Add failing integration cases at the existing application's observable interface.**

For each case, operate through real creation/voting/reset actions or their existing public state interface:

1. Seed a valid record. Start the application. Assert the first current-poll render uses saved options and votes, without an initial null write.
2. Create a poll. Assert a fresh store restores that exact poll. Cast an accepted vote and assert a fresh store includes the new vote immediately.
3. Submit invalid creation input or an accidental duplicate vote. Assert neither causes a storage write.
4. Seed missing, invalid, and unavailable storage. Assert the create screen appears without a crash, with the specification's exact feedback when appropriate.
5. Fail a save. Assert the updated poll remains visible and the warning appears. Accept another change after recovery. Assert the complete poll persists and the storage warning clears.
6. Open reset confirmation, then cancel by button and Escape. Assert memory, guard, and storage remain unchanged.
7. Confirm reset. Assert storage clears first, current poll becomes null, the session guard clears, and unrelated keys survive. Reload and assert the create screen remains.
8. Fail removal. Assert poll, votes, and guard remain unchanged, with reset error feedback and a usable retry. Retry after recovery. Assert the reset succeeds and reset error feedback clears.
9. After successful reset, create a new poll. Assert no old votes or stale current-poll guard return.

- [ ] **Step 2: Run the integration tests through the inspected dependency's harness.** Expect failures for the missing persistence and reset behavior.
- [ ] **Step 3: Wire one startup load before the first application render.** Map each load result to state and feedback without a startup save.
- [ ] **Step 4: Save complete polls from accepted creation and vote transitions.** Keep invalid submissions and rejected votes outside this path.
- [ ] **Step 5: Add the reset confirmation and storage status region.** Use the spec's exact copy and focus rules.
- [ ] **Step 6: Implement reset ordering.** Remove storage first. On success, clear current-poll state and its owned session guard. On error, retain both.
- [ ] **Step 7: Run interface and integration tests.** Expect all cases to pass, including existing creation and same-session voting tests.
- [ ] **Step 8: Run `npm run check` and `npm run build`.** Expect both commands to exit successfully.
- [ ] **Step 9: Verify the real browser flow with the local app.** Use the available browser tooling. Do not claim browser validation from Node tests alone.

Create a poll, cast a vote, refresh, and compare question, option order, votes, and results with the saved state.
Close and reopen the page on the same origin to confirm localStorage lifetime.
Verify the existing same-session guard remains correct. Do not infer a voter from anonymous votes.
Exercise cancellation, confirmation, reset retry, reload after reset, and creation after reset.
Seed an HTML-like question such as `<img src=x onerror=alert(1)>`. Verify it appears only as text, with no executable element.
Use keyboard only to open confirmation, cancel, confirm, and retry. Verify focus targets and polite announcements.
Inspect at 320px, desktop width, and 200% zoom. Verify wrapping, focus visibility, and no horizontal overflow.

- [ ] **Step 10: Record user-visible evidence.** Follow the installed `patchmill-frontend-review` and `patchmill-visual-evidence` skills during implementation.
Commit reference screenshots for the loaded poll, reset confirmation, empty screen after reset, and storage warning where those skills require them.
- [ ] **Step 11: Update README instructions.** Explain local origin/profile storage, browser clearing, reset, one-tab use, and storage warnings.
- [ ] **Step 12: Commit integration, tests, documentation, and required evidence.** Use `feat: restore polls on startup and add confirmed reset`.

## Verification and handoff

The Testing Value Gate selects behavior tests for parsing, data retention, error handling, and accepted state transitions.
Use direct inspection and a browser for visual layout and focus. Do not add document-text or static-configuration assertion tests.
Preserve existing domain tests. Do not duplicate private implementation tests beneath the public storage interface.

Run `node --test tests/*.test.mjs`, `npm run check`, and `npm run build`, plus the dependency's browser test command when present.
Record the exact integration harness command after the dependency checkpoint; no browser harness exists at the inspected base.
A missing browser capability or missing flow is a blocker to full validation, not permission to skip it.
Follow the issue run's implementation publication rules. This planning session does not push or implement product code.

## Visual explanation

Creation and voting must exist before product work begins. Task 1 defines the interface that Task 2 consumes.

```text
inspect authorized branch
  ├─ missing flows/contracts conflict → stop and ask maintainer
  └─ flows available → record exact paths and renew review if material
       → Task 1: storage contract + error/data tests
       → Task 2: hydrate → save accepted changes → confirmed reset
       → real browser refresh, error, keyboard, and responsive checks
       → documentation + visual evidence + implementation handoff
```

## Companion artifacts

- `docs/mockups/2026-11-20-persist-polls-locally.html`: [Full-page mockup](../mockups/2026-11-20-persist-polls-locally.html).

## Open assumptions

The authorized branch will contain the creation and voting flows before execution. The checkpoint prevents accidental scope expansion if it does not.
The maintainer requested recommendations for all choices. Inline execution follows the kernel planning skill.
## Planning review

- Scope: this plan and [the specification](../specs/2026-11-20-issue-6-persist-polls-locally-design.md), both inline explanations, and the linked mockup.
- Initial reviewer: fresh-context `reviewer`, model `openai-codex/gpt-6.1-sol`, thinking `high`.
- Base revision: `7307d6f08264befe63aa55850ab2f98f83afe2ee`.
- Compared specification body SHA-256, initial and final: `c160e383c06f9de7908717e358df122a023880b99745199130238b3fdd1e3ccd`.
- Initial reviewed plan body SHA-256: `7d47bc9ac13c2206f36356071a24e3dfb1c94b59001d089cc11b81324ec8a509`.
- Survey: the reviewer independently inspected poll interfaces, eight passing domain tests, scaffold rendering, glossary, and issue ownership. No creation/voting integration or browser harness exists.
- Findings: no blockers. S1 accepted: Task 2 cases 5 and 8 now assert warning/error clearance after successful recovery. S2 accepted: the mockup now names and links both governing documents.
- Confirmation: a second fresh-context `reviewer`, same model and thinking, confirmed the corrections, links, and preserved dependency checkpoint. No remaining findings.
- Confirmation reviewed and final plan body SHA-256: `cbafcfd7acd008a63de4303063c03ff58bd8f408518c665166e7e37c8079b62f`.
- Confirmed mockup SHA-256: `504d87951ccdf0fb6905b627fa55ca983011df0a6d5a3940154ea8cbd624e4fa`.
- Limits: no reviewer browser, build, installation, or hosting inspection. Planned tests are not implemented behavior. Confirmation used the prior findings and current documents, not saved earlier snapshots.
- Outcome: `ready` as a conditional handoff, not executable at the inspected base. Record actual integration paths and renew review for material changes after dependencies arrive.
