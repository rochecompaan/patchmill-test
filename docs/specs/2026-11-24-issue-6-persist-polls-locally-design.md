# Persist polls locally — Issue #6

[Issue #6](https://github.com/rochecompaan/patchmill-test/issues/6) keeps the demo usable after refresh. Issue #4 is already on the base. In `src/main.ts`, `showPoll` replaces the create form and keeps the poll and vote guard inside the view. A refresh loses both.

## Scope and approaches

Use `localStorage` for one current poll per browser profile and origin. One synchronous write saves the entire snapshot, so a vote and its poll cannot get out of step. `sessionStorage` also survives refresh but loses the poll when the tab closes. IndexedDB adds transactions and async setup without a benefit for one demo poll.

The Team Lunch Poll context and the terms in [GLOSSARY.md](../../GLOSSARY.md) stay unchanged. The current poll is the active snapshot, not a separate domain entity. A vote remains a selection, not a voter record. Two options can have the same label and distinct IDs. The browser demo accepts one vote per current poll, across refreshes. `src/poll.ts` still supports multiple votes. No glossary update or ADR is needed: only the local persistence seam changes.

Drafts, results changes, poll history, voter identity, sync, migrations, and cross-tab coordination are out of scope. Concurrent tabs can overwrite or recreate each other's saved poll. Refresh guarantees apply to the single-tab demo with working storage.

## Persistence interface

`src/poll.ts` retains the pure poll operations. A new `src/poll-storage.ts` module owns the storage key `team-lunch-poll:v1`, JSON, and runtime validation. Its payload is one `Poll` snapshot, with the version in the key. It accepts nonblank question and labels, at least two options with unique nonblank IDs, and zero or one vote with an exact option ID match. It preserves order and IDs. This format is for snapshots the demo can produce, not all possible domain snapshots.

The page supplies a lazy storage accessor to `createPollStore`. Production supplies `() => window.localStorage`. Tests supply a map-backed adapter or a throwing accessor. Each operation calls the accessor inside its error handling because access itself can throw. No separate storage service or exported parser is necessary. The operation interface is:

| Operation | Result and caller obligation |
| --- | --- |
| `load()` | `loaded` with a validated poll, `empty` for a missing key, `invalid` for bad JSON or shape, or `unavailable` for a storage error. It never writes or erases data. |
| `save(poll)` | `true` on successful write, otherwise `false`. The caller passes the latest demo snapshot after a successful create or vote. |
| `clear()` | `true` if the poll key is absent after removal, otherwise `false` on a storage error. It does not touch other keys. The caller waits for success before clearing the view. |

Depth comes from hiding parsing, validation, and storage exceptions behind this interface. The page has leverage without knowing the key or JSON format. Format changes stay local to the module. Node tests use the same operation interface as `src/main.ts`. The module performs one synchronous storage operation per call. Load and save process data proportional to snapshot size. This is suitable for one short demo poll.

## Page behavior and frontend design

Frontend design applies because reset changes page controls, focus, and user flow. Keep the existing plum, lilac, mint, paper, ink, and rule colors. Keep the Georgia title, sans-serif body, and `40rem` workspace breakpoint. The existing page takes priority over new styling. Keep the Results notice unchanged.

- On startup, load before showing the ready view. A valid snapshot shows the poll without moving focus. A saved vote shows the same receipt and **Your vote** marker as a new vote. Disable all Vote buttons. Restore the selection by ID, not by label or ordinal.
- If the key is absent, show the existing create form. If data is invalid, show the form and `The saved poll could not be read. Save a new poll to replace it.` A valid new poll can overwrite the bad value. If access fails, show `Browser storage is unavailable. A refresh may lose this poll.`
- Save only after `createPoll` or `castVote` succeeds. The page owns the active snapshot and uses its vote to guard repeated activation. A failed write keeps the new poll or vote usable in memory and shows `Could not save this poll. A refresh may lose your changes.` Clear the message on a successful write or reset. Put storage messages in a live region outside the swapped panels.
- Below the options, show a secondary **Reset poll** button. Its activation reveals `Reset this poll and remove its votes from this browser?` with **Cancel** and **Reset poll** actions. Label the confirmation group by its prompt. Hide the opener while the group is visible. Move focus to **Cancel**. If the user cancels, restore focus to the opener without changing storage or the poll.
- On confirmation, remove the poll key first. On failure, retain the poll and confirmation and show `Could not reset this poll. Try again.` On success, show a clean create form and focus **Poll question**. Restore two blank options, clear draft errors, and allow another create, vote, and reset cycle without reload.
- Keep native buttons, visible focus, and targets at least `2.75rem` high. Allow controls and long labels to wrap. Do not add motion.

## Acceptance and verification

| Behavior | Verification |
| --- | --- |
| A poll with no votes survives refresh in option order. | Storage round-trip test and browser refresh before voting. |
| A vote survives refresh and cannot be cast again. | Refresh after voting for the second of two identical labels. Check the ordinal, marker, receipt, and disabled actions. |
| Cancel leaves the poll intact. Confirm clears memory and storage. | Check focus, refresh after reset, and create and vote again. Test that reset leaves unrelated keys intact. |
| Bad data or storage errors do not crash the demo. | Test load, write, and removal errors. Check messages and the current view in the browser. |
| Reset fits the existing page on mobile and desktop. | Use keyboard and inspect at 320 and 1280 CSS pixels. |

## Visual explanation

```text
Startup → Read saved poll → Valid → Show poll with vote state from snapshot
                        └─ Otherwise → Show create form
Create or vote succeeds → Adopt snapshot → Save it → Show current poll
Confirm reset → Remove saved poll → Success → Show clean create form
                                  └─ Error → Keep poll and offer retry
```

## Companion artifacts

- `docs/mockups/2026-11-24-persist-polls-locally.html`: [Full-page reset and restore mockup](../mockups/2026-11-24-persist-polls-locally.html).
## Planning review

Combined scope: this design, the [plan](../plans/2026-11-24-issue-6-persist-polls-locally-plan.md), both inline visuals, and the mockup. Both passes used fresh `reviewer` sessions with `openai-codex/gpt-6.2-sol`, thinking `xhigh`. Base: `45b4e1fd100747fb07ecd03b7a550f13b30a24b8`.

**Initial pass.** Design body: `cddc0e3b8362f332e1814efac9e13fd9c733f1f97662745b3a43647910dcd4c7`. Plan body: `4d9866aab4ec4858f209c38250731535e43d25571cfce0ddcfbbb503e39cf7d4`. The reviewer traced the pure poll operations and the page-level vote guard. The storage seam preserves those responsibilities.

- B1, **Accepted**: Task 2 now checks startup with inaccessible storage. The plan visual and review focus include that case.
- S1, **Accepted**: Task 1 now uses nonsequential IDs in nonsorted order to catch ID regeneration and reordering.
- S2, **Accepted**: The mockup now names its owning spec in its metadata.

**Scoped confirmation.** The reviewer verified all three corrections and found no remaining blockers. All nine base Node tests passed. The reviewer checked links and HTML statically. The planner inspected the offline mockup at 320 and 1280 pixels. No implementation build or browser persistence test ran.

Final design body: `cddc0e3b8362f332e1814efac9e13fd9c733f1f97662745b3a43647910dcd4c7`. Final plan body: `8f4203f01a02605573020377d0d10e625aba9638cd3aeb8e4f95208e17d735e2`. Outcome: `ready`.
