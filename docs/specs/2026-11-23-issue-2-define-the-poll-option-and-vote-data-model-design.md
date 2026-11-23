# Poll, option, and vote model — Issue #2

## Scope

The app needs one local poll snapshot that future forms, voting, and results can share. A snapshot holds the question, lunch options, and individual votes. The model has one context: Team Lunch Poll.

The inspected `main` revision (`4eb64b6`) contains the project brief and issue prompts but no app source, callers, or tests. The open scaffold PR #13 proposes TypeScript and a CSS-only `src/main.ts` import. This model does not require that PR or modify its files.

Frontend design does not apply. This issue adds no visible layout, interaction, or user flow. Poll creation, vote submission, double-vote prevention, result presentation, and browser storage remain separate work. The model does not define a winner or a tie policy.

## Approaches

- **Keep votes in the poll and derive counts.** This keeps one source of truth for votes. Results scan a small local collection.
- **Store counts on options instead.** This reduces stored data, but it loses individual vote records and makes a count stand in for a vote.

The design uses the first approach. No ADR is necessary: no existing callers or stored data constrain this decision.

## Module interface

The `src/poll.ts` module owns these exported TypeScript types. All fields and array views are `readonly` at the type level.

| Type | Fields |
| --- | --- |
| `Poll` | `question: string`, `options: readonly PollOption[]`, `votes: readonly Vote[]` |
| `PollOption` | `id: string`, `label: string` |
| `Vote` | `optionId: string` |
| `OptionVoteCount` | `optionId: string`, `count: number` |

Option IDs are nonempty, unique within the poll, and stable for the life of the option. If votes still reference a removed option ID, callers must not reuse that ID in the poll. A vote refers to an option in the same poll. The poll owns both collections, so neither a vote ID nor a poll ID is necessary. Option labels do not identify options. The model neither requires unique labels nor defines form rules for text or option count. Callers supply the data and preserve the invariants. A snapshot with no votes is valid. The snapshot contains only plain objects, arrays, and strings, so JSON can represent it without custom serialization.

`countVotes(poll: Poll): readonly OptionVoteCount[]` returns a fresh list of fresh rows in option order. The list has one row per option, even with zero votes. An empty option list returns an empty list. Each matching vote contributes one count. Several votes can name the same option. The function ignores a vote with an unknown option ID. It does not validate malformed JSON or duplicate option IDs. Such data is outside the interface contract, apart from the explicit unknown-ID rule for stale votes. The function does not mutate the snapshot or throw for an unknown ID.

For example, two options labeled “Pizza” remain distinct when their IDs differ. If two votes name the first ID, its count is two and the second count is zero. Moving the first option changes row order but not which option receives the votes. If a stale vote names a removed ID, that vote does not count toward any remaining option.

## Ownership and verification

The module hides its count lookup. It spends linear time in the number of options plus votes and uses space proportional to the number of options. Central counts improve depth: future results callers get ordered totals without repeating ID matching or zero-count rules. This gives callers leverage and keeps count rules local to the module.

The exported interface is the only seam. The operation uses in-process data and needs no internal seam, configuration, dependency injection, or production or test adapter. Tests pass plain snapshots through the same interface as future callers. Behavior tests check ordered counts, repeated votes, distinct IDs, zero counts, stale votes, and empty collections. Direct type checking and inspection cover the data shapes and the absence of I/O or UI changes.

## Companion artifacts

- [`GLOSSARY.md`](../../GLOSSARY.md): Poll, Option, Vote, and Vote count.

## Visual explanation

```text
Poll snapshot
├─ question
├─ options (in order) ── each has an ID and label
└─ votes              ── each names one option ID
           │
           ▼
countVotes → one count per option, in option order
```
## Planning review

Combined scope for both passes: this specification and the [implementation plan](../plans/2026-11-23-issue-2-define-the-poll-option-and-vote-data-model-plan.md).

Reviewer for both passes: `reviewer`, `openai-codex/gpt-6.2-sol`, `xhigh`. Base: `4eb64b6d8bf5a9d23d1a9fe7cfa2dbb498918a2a`.

**Initial pass.** Reviewed spec body: `2d22c050ef2cb400066beb186a1fa3df66a56b1b732120fbfefa4c0f98c35b3e`. Reviewed plan body: `444e61ce2676aa01745f1ecbc4edb07073dc9b81447d6443e156b78ae43ff42d`.

The reviewer found no app code, callers, or tests on the base. The glossary and the pure tally interface matched the issue. Findings:

- B1 (plan blocker), **Accepted**: Run RED against a typed stub so the assertions run. Update the plan diagram.
- S1 (spec suggestion), **Accepted**: Forbid reuse of an option ID while stale votes still reference it.
- S2 (plan suggestion), **Accepted**: Check freshness at every row index.

**Scoped confirmation.** The reviewer found all three corrections complete. Node 24 probes showed the stub fails all three tests and a representative tally passes. The reviewer inspected both inline diagrams and local links. The probes used virtual modules. The file-backed suite and TypeScript check remain implementation steps. The reviewer did not query live issue or PR metadata.

Final spec body: `d1c0237a71898acf2d18bba3997c6ca6fd638583af2ea6a15b920b8598155281`. Final plan body: `e5359ead38930c53574b6f6686483b665fc7290d96995d27eb513c99cf97d2ef`. Outcome: `ready`.
