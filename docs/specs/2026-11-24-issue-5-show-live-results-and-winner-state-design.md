# Show live results and winner state — Issue #5

[Issue #5](https://github.com/rochecompaan/patchmill-test/issues/5) lets a teammate see how many votes each lunch option has and whether one option leads. [Issue #4's voting flow](2026-11-23-issue-4-add-the-option-voting-flow-design.md) is now on the base branch. It accepts one successful vote per saved poll view. The poll model itself can contain several votes.

## Approach and scope

Use the existing Results notice. Derive the results from the current poll snapshot after save and after each successful vote. Counts beside the Vote buttons would avoid repeating labels, but would mix voting actions and results. A separate running tally could avoid recounting, but would duplicate state and could disagree with the recorded votes. The existing notice and derived results keep both concerns separate without adding navigation.

“Live” means the same browser view updates immediately, without reload or a new action. “Current leader” is not a final winner. This issue does not close polls, change the vote limit, add persistence, sync browsers or tabs, or add a backend. A tie can occur in a poll snapshot with several votes. It is not reachable through the current one-vote browser flow, and the app must not add a way to cast extra votes to demo it.

## Results and frontend design

Frontend design applies because the Results notice changes layout and adds visible feedback. Keep the existing Georgia title and system sans-serif body. Use the existing plum `#3d2452`, lilac `#f2edf8`, mint `#e5f5eb`, paper `#fffafc`, ink `#20352c`, and rule `#49695a`. The existing design takes priority over a new visual style. Keep the `40rem` workspace breakpoint. Stack Results below the poll on narrow screens. Use the existing notice beside the poll at desktop widths.

| State | Summary | Rows |
| --- | --- | --- |
| No poll | `Voting results will appear here.` | No rows |
| No counted votes | `No votes yet. Choose an option to vote.` | Every option shows `0 votes`. No markers. |
| One option has the highest positive count | `Current leader: Option N: Label.` | Only that option gets a text marker `Leader` and a paper highlight. |
| Several options share the highest positive count | `The poll is tied.` | Each tied option gets `Tied for lead`. No `Leader` marker or sole-leader highlight. |

Keep the option order. Show each ordinal (`Option N`), label, and whole-number count (`1 vote` or `N votes`). Distinguish duplicate labels by ordinal. A tie below the highest count does not change a sole lead. Use a semantic list, visible text rather than color alone, and no motion. Allow labels and the summary to wrap. Keep the count easy to scan and allow it to move below the label at narrow widths.

Keep the question focus on save and the receipt focus after a successful vote. Link the focused receipt to the Results summary with `aria-describedby`. Update the summary before moving focus so it describes the new result. Do not add a second live announcement or take focus away from the receipt. Show labels and summary text as literal text, not HTML.

## Module interface

The Team Lunch Poll context and its poll, option, vote, and vote count relationships do not change. A leader or tie describes a result, not a stored domain entity. No glossary change or ADR is necessary. This extends the existing poll module without changing architecture.

Add `getPollResults(poll: Poll): PollResults` to `src/poll.ts`. `PollResults` contains `readonly counts: readonly OptionVoteCount[]` and `readonly leadingOptionIds: readonly string[]`. The caller supplies the current poll snapshot with unique option IDs. The module returns counts in option order, including zeros, by using `countVotes`. Unknown vote IDs do not count. The leading IDs are all options with the highest positive count, in the same order. Zero IDs mean no counted votes. One means a sole leader. More than one means a tie. No options or only unknown votes also yield no leading IDs. The call does not mutate the poll or throw for those cases. It runs in linear time in options and votes, uses space proportional to the options, and has no configuration or I/O.

The interface hides the maximum search and zero-vote rule. That depth gives callers and tests one snapshot input for both counts and leading IDs. This keeps tally rules local to the poll module. The in-process seam needs no adapter or injected dependency. Node tests and `src/main.ts` use the same interface.

`showPoll` in `src/main.ts` owns the snapshot and vote guard. After it shows a saved poll, it passes the initial snapshot to a private Results renderer. After `castVote` succeeds, it replaces `currentPoll` and renders from `result.poll` before focusing the receipt. Rejection or a repeat activation leaves results unchanged. The renderer maps counts and leading IDs to visible rows. It keeps DOM references and markup private and stores no tally. At the browser seam, use the real DOM in production and the real browser for checks. No fake DOM or test-only interface is needed.

## Global constraints

- Use Node.js 24 LTS, npm 11, Vite, and vanilla TypeScript.
- Use no new dependencies, remote assets, backend, or persistent storage.
- Keep the existing one-vote guard, receipt, and page shell.

## Acceptance and verification

| Requirement | Verification |
| --- | --- |
| Show all options with accurate counts in order. | Test `getPollResults` with duplicate labels, a zero-count option, and unknown vote IDs. Save a poll in the browser and check each ordinal, label, and count. |
| Update immediately after each successful vote without counting a second attempt. | In the browser, vote for the second of two identical labels. Check the new count and leader without reload. Try repeat activation and check that nothing changes. |
| Distinguish a sole leader, a tie, and no votes. | Test each result through the poll module. Use a valid multi-vote snapshot in local browser verification to check the tied view and the transition to a sole leader. |
| Preserve focus and readable layout. | Check keyboard focus, the receipt's accessible description, and wrapping at 320 and 1280 CSS pixels. Reload and check the no-poll notice. |

## Visual explanation

```text
Save poll or accept vote → current poll snapshot → count each option
                                                   │
                            No positive maximum ───┼─ No votes yet
                            One option at maximum ─┼─ Current leader
                            Multiple at maximum ───┴─ The poll is tied

The results list always keeps the original option order.
```

## Companion artifacts

- `docs/mockups/2026-11-24-show-live-results-and-winner-state.html`: [Full-page results mockup](../mockups/2026-11-24-show-live-results-and-winner-state.html).
## Planning review

Combined scope: this design, the [plan](../plans/2026-11-24-issue-5-show-live-results-and-winner-state-plan.md), their inline visuals, and the linked mockup. Both passes used `reviewer`, `openai-codex/gpt-6.2-sol`, thinking `xhigh`. Base: `45b4e1fd100747fb07ecd03b7a550f13b30a24b8`.

**Initial pass.** Design body SHA-256: `33354080b0504263ecc10cbef315af38dd9dacfd80346c35f9a28f5f6833667f`. Plan body SHA-256: `cce373b936a509746f0beae484e430d5abd71d456b61f76f3231994dea3094ab`.

The reviewer traced `castVote`, `countVotes`, and the `showPoll` guard. The reviewer found no blockers. Nine base tests passed. An in-memory probe showed the planned tests fail without the new export and pass with a trial implementation.

- S1, **Accepted**: Named the owning design in the mockup.
- S2, **Accepted**: Named browser DevTools Sources and the exact breakpoint in Task 2.

**Scoped confirmation.** The reviewer confirmed both changes and traced how the seeded snapshot reaches the vote handler. An in-process probe confirmed the change from `1, 1, 0` to `1, 2, 0`. Both reviews used static inspection and Node tests, not a browser or build. The planner opened the mockup from disk at mobile and desktop widths with network resolution blocked. Production browser behavior, accessibility, and the build remain implementation checks.

Final design body SHA-256: `33354080b0504263ecc10cbef315af38dd9dacfd80346c35f9a28f5f6833667f`. Final plan body SHA-256: `2332a51d09b2f5fa6f02b34a17579be130a5a94833d11796db8aaf5281a7e202`. Outcome: `ready`.
