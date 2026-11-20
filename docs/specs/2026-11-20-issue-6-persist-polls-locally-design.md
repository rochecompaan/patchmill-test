# Persist polls locally

## Intent and evidence

Issue #6 keeps the current lunch poll and its votes after a refresh. Users also need a clear way to start over.

Inspected base: `7307d6f08264befe63aa55850ab2f98f83afe2ee`.
`src/main.ts` only imports styles. `index.html` contains two scaffold placeholders.
`src/domain/poll.ts` exports `Poll`, `PollOption`, `Vote`, and `countVotes`.
`tests/poll.test.mjs` verifies anonymous votes, stable option IDs, derived counts, and JSON compatibility.
The branch has no application state owner, creation handler, or voting handler.
`issues/03-create-poll-form.md` and `issues/04-voting-flow.md` own those missing flows.
The triage comment predates the scaffold and model. Those two dependencies now exist.
No repository `AGENTS.md`, context map, legacy context document, or ADR exists in the inspected worktree.

The maintainer requested recommendations for all remaining choices. The choices here are planner recommendations, not prior product decisions.

## Scope and approaches

- **Use localStorage:** one synchronous JSON record survives refresh and browser restart. It fits this small, local demo.
- **sessionStorage:** simpler lifetime isolation, but closing a tab loses the demo. Reject this approach.
- **IndexedDB:** supports larger data and transactions, but adds unnecessary asynchronous coordination. Reject this approach.

Plan now. Implement after the create-poll and voting flows are available on the authorized implementation branch.
Do not claim persistence is delivered through a disconnected storage module or a synthetic demo poll.
If those dependencies remain absent, stop implementation and ask the maintainer for sequencing guidance.
Do not merge branches, replace other issue work, or build the missing flows under this issue.

Goals: restore the complete current poll, save each accepted change, recover safely from storage problems, and reset deliberately.
Non-goals: accounts, shared devices, networking, history, migrations, cross-tab synchronization, and new voting or results features.
One active tab is supported. Concurrent tabs use last successful write wins and can overwrite each other.
Browser storage is local to the origin and browser profile. It is not a backup or a team-sharing mechanism.

## Domain and ownership

This is an architectural change: it introduces an external storage seam and application lifecycle behavior.
Domain modeling and codebase design apply. The existing glossary defines the unchanged poll, option, vote, and vote count terms.
There remains one lunch-poll context. No new domain term or context relationship needs a glossary update.
No ADR is necessary for this small, replaceable local implementation.

The domain module continues to own poll shapes and count derivation. Do not store derived vote counts.
The existing application state owner, once available, owns the current `Poll | null`, accepted transitions, and rendering.
The persistence module owns serialization, schema checks, key access, and storage error classification.
Never infer a voter's identity or session voting permission from anonymous vote records.
Preserve the voting flow's existing same-session guard. Reset must clear its current-poll state through its owner.
This issue does not add a new durable voter marker or promise refresh-proof double-vote prevention.
If the dependency imposes a conflicting storage or lifecycle contract, ask before changing it.

## Persistence interface

Create `src/persistence/poll-storage.ts` with this public interface:

```ts
import type { Poll } from '../domain/poll.ts';

export type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type LoadResult =
  | { status: 'loaded'; poll: Poll }
  | { status: 'empty' | 'invalid' | 'unavailable'; poll: null };
export type WriteResult = { status: 'ok' | 'unavailable' };
export interface PollStorage {
  load(): LoadResult;
  save(poll: Poll): WriteResult;
  clear(): WriteResult;
}
export function createPollStorage(getStorage: () => StoragePort): PollStorage;
```

The composition root injects `() => window.localStorage`. Resolve this getter inside each guarded operation, not during module import.
Production uses the browser Storage adapter. Tests use a stateful in-memory adapter with configurable read, write, removal, and getter errors.
This external seam represents real I/O variation. No separate adapter class or private test-only interface is needed.
All operations are synchronous. Storage exceptions never escape this interface.
`save` consumes a valid, well-typed domain poll. Callers must obey the domain model's existing invariants.
The module does not validate form inputs or mutate caller data.

Use the single key `team-lunch-poll.current`, with JSON `{ "version": 1, "poll": <Poll> }`.
The module hides the key, format, parser, and validator from callers. No configuration is required.
`clear` removes only this key. Never call `localStorage.clear()`.
Each save replaces the entire record with one `setItem`, including every vote.
Do not debounce, wait for unload, or save only a selected option or count.
Each operation costs O(options + votes + string content). No asynchronous queue or hidden startup write exists.

### Unknown-data validation

Treat parsed JSON as unknown. Accept only a non-null object with `version === 1` and a valid poll.
Require string IDs, question, labels, and vote references. IDs must be nonblank after a whitespace check, but retain their original values.
Require unique option IDs and references to existing options. Use `Set` or `Map` for opaque IDs such as `__proto__`.
Require options and votes arrays. Empty arrays, empty question strings, and empty labels remain valid domain states.
Do not impose the create form's two-option minimum on stored domain data.
Accept extra fields but reconstruct only the documented domain fields. Preserve string content and array order exactly.
Repeated anonymous vote records remain distinct votes.
Malformed JSON, wrong versions, invalid shapes, duplicate IDs, and dangling votes return `invalid` with no partial poll.
A missing key returns `empty`. Getter and Storage exceptions return `unavailable`.
Loading never overwrites or removes data, including unknown versions.
An explicit later creation/save or confirmed reset can replace or remove the record.

## Application lifecycle

1. Construct the storage module at startup and call `load` once before the first application render.
2. Use a loaded poll as the current poll. Otherwise, show the existing empty/create screen.
3. Never persist an initial null state over restored data.
4. After each accepted creation or vote transition, save the complete new poll before the handler returns.
5. Rejected input and duplicate-vote attempts do not trigger writes.
6. If a save fails, keep the accepted in-memory state and show the storage warning. A later accepted change retries the full save.
7. A successful save or reset clears the storage warning. Do not claim success after an error.

Invalid data shows: “Saved poll data could not be loaded. Create a new poll to start over.”
Unavailable reads or writes show: “Browser storage is unavailable. Changes may be lost after refresh.”
Use a persistent `role="status"` region with polite announcements. Do not announce an ordinary empty load as an error.
Restored strings enter the page through text nodes or existing safe rendering, never raw HTML.

## Reset and frontend design

Frontend design applies because reset and storage feedback change the user flow.
Preserve the existing white background, green text, Trebuchet type, blue focus outline, and responsive workspace.
Repository continuity overrides generic guidance for a new visual identity. Do not redesign the application.
Use tokens from `src/style.css`: `#ffffff`, `#18352c`, `#425c52`, `#f0f7f2`, `#c4d6cb`, and `#005fcc`.
Keep text left aligned. Put reset after current-poll content, visually separate from vote actions.
The mockup shows context, not a request to implement forms, voting, or results in this issue.

```text
Team Lunch Poll
[Current poll and existing results]
Storage feedback, only when needed
[Reset poll]
  Reset this poll and all votes?
  [Keep poll] [Reset poll and votes]
```

Show `Reset poll` only when a current poll exists. It opens an inline confirmation group without changing memory or storage.
The prompt is “Reset this poll and all votes?” Buttons are “Keep poll” and “Reset poll and votes”.
Focus “Keep poll” when the group opens. Escape cancels, and cancellation restores focus to “Reset poll”.
Confirmation first calls `clear`. On success, clear current-poll state and its session guard, then render the existing empty/create screen.
Focus the create screen's heading, with `tabindex="-1"` if needed. Announce “Poll reset. Create a new poll.”
If removal fails, retain the poll, votes, and session guard. Keep confirmation available for retry.
Show “The poll could not be reset. Browser storage is unavailable. Try again.” Do not falsely show a fresh start.
Reset never removes unrelated keys. Repeated resets cannot restore old data.
Use native buttons, visible focus, wrapping text, and no horizontal overflow at 320 CSS pixels or 200% zoom.
No animation is required. The standalone mockup has no motion or network assets.

## Acceptance and verification

1. A valid poll survives a JSON save/load round trip with all votes and exact ordering. Verify through the storage interface.
2. Missing, malformed, unsupported, and inaccessible data never crashes startup. Verify with adapter tests and a browser reload.
3. Load occurs before rendering. Accepted creation and votes save immediately. Verify integration tests and real browser refreshes.
4. Cancel leaves data untouched. Confirm removes only the owned key and returns to creation. Verify interface and browser tests.
5. Failed writes retain memory and warn. Failed reset retains the old poll. Verify throwing adapters and browser interaction.
6. Restored user strings remain inert text. Verify with an HTML-like question in a browser fixture.
7. Preserve same-session voting behavior. Verify the dependency's guard before and after restore/reset, without inventing identity.
8. Reset and feedback work with keyboard, mobile width, and zoom. Verify in the browser and commit implementation screenshots later.

Automated tests target behavior, error recovery, and data integrity. Do not add tests that inspect documentation or CSS text.

## Visual explanation

Startup reads before rendering. Only accepted user changes write. Reset changes memory only after storage removal succeeds.

```text
startup → load → loaded poll ──────────────→ render poll
               empty/invalid/unavailable → render create screen (+ feedback)
accepted create/vote → update memory → save entire poll → render (+ warning on error)
reset → confirmation → cancel → unchanged
                     → clear key → success → clear memory/guard → create screen
                                 → error   → retain poll/guard → retry feedback
```

## Companion artifacts

- `docs/mockups/2026-11-20-persist-polls-locally.html`: [Full-page reset and feedback mockup](../mockups/2026-11-20-persist-polls-locally.html).

## Open assumptions

The implementation follows creation and voting integration, not just the existing scaffold and model.
The precise handler locations require inspection when those dependencies arrive. The plan includes a mandatory checkpoint for that inspection.
All remaining choices use the recommendations requested by the maintainer. No human-only question remains open.
## Planning review

- Scope: this specification and [the implementation plan](../plans/2026-11-20-issue-6-persist-polls-locally-plan.md), including both inline explanations and the linked mockup.
- Initial reviewer: fresh-context `reviewer`, model `openai-codex/gpt-6.1-sol`, thinking `high`.
- Base revision: `7307d6f08264befe63aa55850ab2f98f83afe2ee`.
- Initial reviewed specification body SHA-256: `c160e383c06f9de7908717e358df122a023880b99745199130238b3fdd1e3ccd`.
- Initial reviewed plan body SHA-256: `7d47bc9ac13c2206f36356071a24e3dfb1c94b59001d089cc11b81324ec8a509`.
- Survey: the domain module and eight existing tests establish stable IDs, anonymous votes, and derived counts. The entry point imports CSS only.
- The reviewer independently inspected source, tests, glossary, issue prompts, and existing model design. Creation and voting remain absent.
- Findings: no blockers. S1 accepted: add explicit save/reset recovery feedback-clearance assertions to Task 2. S2 accepted: identify and link governing documents in the mockup.
- Confirmation: a second fresh-context `reviewer`, same model and thinking, verified both corrections and their effects. No remaining findings.
- Confirmation reviewed and final specification body SHA-256: `c160e383c06f9de7908717e358df122a023880b99745199130238b3fdd1e3ccd`.
- Confirmation reviewed and final plan body SHA-256: `cbafcfd7acd008a63de4303063c03ff58bd8f408518c665166e7e37c8079b62f`.
- Confirmed mockup SHA-256: `504d87951ccdf0fb6905b627fa55ca983011df0a6d5a3940154ea8cbd624e4fa`.
- Limits: reviewer did not run a browser, build, installation, or hosting inspection. Future integration contracts and storage behavior cannot be verified at this base.
- Planner separately opened the standalone mockup at desktop and mobile widths. This is planning evidence, not product validation.
- Outcome: `ready` as a conditional handoff. Implementation must stop at the dependency checkpoint until creation and voting exist. Readiness is not human approval.
