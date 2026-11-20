# Poll, option, and vote model

## Intent and evidence

Issue #2 needs a small shared model for local browser state. Forms, voting, and results must use the same names and relationships.

At base `097cb2aa1d994dc182f1a9083eef41d63a59c436`, the repository contains only documents and issue prompts. There are no source modules, callers, tests, package configuration, glossaries, or ADRs.
`PROJECT_BRIEF.md` suggests TypeScript and local state. `issues/03-create-poll-form.md` assigns form creation to a later issue.
`issues/04-voting-flow.md` assigns double-vote prevention to the voting flow. `issues/05-results-view.md` assigns winner and tie presentation to results.
`issues/06-local-persistence.md` assigns browser storage to persistence. `issues/07-validation-empty-states.md` assigns user-input validation to a later issue.
The live issue has no review comments at planning time.

## Scope and approaches

This is an architectural change because it establishes the shared domain interface and behavior ownership.
Domain modeling and codebase design apply. There is one lunch-poll context, with no context map or adapters.
Frontend design does not apply: this issue changes no visible layout, interaction, or user flow.

The maintainer delegated remaining choices to the planner's recommendations.

- **Recommended: anonymous vote records inside a poll.** Stable option IDs preserve relationships after labels or ordering change. Counts derive from records.
- **Counters on options:** slightly smaller, but no separate vote structure and two sources of truth if records arrive later.
- **Identified voters and separate entity tables:** support account-level enforcement but add identity and synchronization requirements outside this local demo.

Use the recommended approach. Do not create product UI, storage, factories, voting commands, identity, timestamps, winner selection, or schema migrations.
No ADR is necessary: this small local model has no deployed schema or expensive reversal cost.

## Model and ownership

Create one module, `src/domain/poll.ts`. Export these TypeScript shapes:

```ts
export interface PollOption {
  readonly id: string;
  readonly label: string;
}

export interface Vote {
  readonly optionId: string;
}

export interface Poll {
  readonly id: string;
  readonly question: string;
  readonly options: readonly PollOption[];
  readonly votes: readonly Vote[];
}

export interface OptionVoteCount {
  readonly optionId: string;
  readonly count: number;
}

export function countVotes(poll: Poll): readonly OptionVoteCount[];
```

The poll owns its ordered options and votes. A vote references an option within its containing poll, so it needs no `pollId`.
Votes have no identity, voter, or timestamp. Identical vote records represent distinct selections and each contributes one vote.
There is no persisted count field. The entire poll uses JSON-compatible objects, strings, and arrays.
Readonly properties express caller discipline, not runtime freezing or validation.

### Caller obligations

- Callers supply nonblank, stable poll and option IDs. Option IDs are unique within a poll, not necessarily across polls.
- IDs are opaque strings, not labels or array indexes. Renaming or reordering an option preserves its ID.
- Question and label strings pass through unchanged. User-facing trimming, required fields, and the two-option minimum belong to form validation.
- An empty options array and an empty votes array are valid model states. A missing current poll belongs to application state, not this shape.
- Each vote must reference an existing option in its containing poll.
- Callers supply well-typed values with unique IDs. This module does not parse unknown JSON or detect duplicate option IDs.
- Callers prevent same-browser double-voting later. The model cannot infer whether two anonymous records came from one person.

### Counting behavior

`countVotes` returns a fresh array with one fresh result object per option, in the original option order.
It includes zero counts, counts every vote once, and never mutates the poll or nested values.
An empty poll returns `[]`. Option labels do not affect counting, even when two labels match.
If any vote references an unknown option, throw `RangeError`. Do not silently lose that vote or return partial results.
The error message is not a public contract. Runtime shape checks and other malformed-input recovery remain out of scope.

The implementation takes O(options + votes) time and O(options) auxiliary space.
A private `Map` can handle opaque keys such as `__proto__` without object-property collisions.

## Module design

The module owns relationships and count derivation. Its interface includes the shapes, ordering, preconditions, error behavior, and cost described above.
The counting index remains hidden. No configuration, clock, ID generator, browser global, or external dependency enters the module.
All dependencies are in-process values. No production or test adapter varies here, so no adapter interface or private test seam is justified.
The external seam is the exported module interface used by future callers and current tests.

Depth comes from one counting operation that hides zero initialization, reference checks, key safety, and ordering.
This gives callers leverage without duplicated count logic. Keeping the shapes and behavior together preserves locality.
Deleting the module forces later forms, voting, and results to repeat these contracts and counting rules.

## Acceptance and verification

1. Export the four shapes and `countVotes` from one browser-independent TypeScript module. Verify with strict TypeScript checking and source inspection.
2. Preserve poll data through a JSON round trip. Verify by comparing the parsed poll and its derived counts.
3. Count repeated selections, include zero-vote options, and preserve option order. Verify with direct interface tests.
4. Distinguish equal labels, reordered options, and identical option IDs in separate polls. Verify with interface tests.
5. Reject unknown option references without mutation. Verify `RangeError` and compare inputs before and after counting.
6. Support empty polls and opaque IDs without browser globals or dependencies. Verify with Node interface tests, including frozen inputs.

Type declarations need compiler verification, not tests that inspect source text. Behavioral counting and JSON tests catch meaningful regressions.
Node 24 supports direct execution of the module's erasable TypeScript. Tests need no app scaffold or test framework dependency.
Use a pinned TypeScript compiler for the source-only strict check. Future app tooling can incorporate the module without changing its interface.

## Visual explanation

The poll contains the records. Counting follows option IDs, not labels or positions.

```text
Poll { id, question }
  options (ordered)
    { id: "soup", label: "Soup" } <── Vote { optionId: "soup" }
    { id: "wrap", label: "Wrap" } <── Vote { optionId: "wrap" }
                                <── Vote { optionId: "wrap" }
  votes (anonymous records)

countVotes(poll) → [{ optionId: "soup", count: 1 },
                    { optionId: "wrap", count: 2 }]
```

## Companion artifacts

- `GLOSSARY.md`: [Canonical poll terms](../../GLOSSARY.md).

## Open assumptions

None requiring a maintainer answer. Anonymous records and the tooling choices are planner recommendations under the maintainer's delegation.

## Planning review

- Scope: this specification and [the implementation plan](../plans/2026-11-20-issue-2-define-the-poll-option-and-vote-data-model-plan.md).
- Reviewer: fresh-context `reviewer`, model `openai-codex/gpt-6.1-sol`, thinking `high`.
- Inspected base: `097cb2aa1d994dc182f1a9083eef41d63a59c436`.
- Reviewed specification body SHA-256: `1286653b69c0d1bd49dc1991b88e5217d6ad90776e303ad873326ffe83f3268b`.
- Reviewed plan body SHA-256: `65ad78d642eb6f4936f3928f22e74d63fccdfe8008eb4519723d0675bc397d21`.
- Survey: the tracked base contains documents only. Neighboring issues retain form, session voting, results, and storage ownership.
- The reviewer independently inspected repository history, issue prompts, glossary, interface contracts, and both inline explanations.
- Findings: no blockers or suggestions. No dispositions remain open.
- Limits: no implementation, tests, compiler, installation, or hosting inspection. Scaffold integration and compiler availability remain implementation checks.
- Confirmation: not required because no corrections were requested.
- Record insertion adds one separator newline after the reviewed body. No substantive content changed.
- Final body SHA-256: `b1ed23164dbab39ae725d69715ec114fcf17434007ac8f0cf154eff5238b292b`.
- Outcome: `ready`. This records readiness, not maintainer approval.
