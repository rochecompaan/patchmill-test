# Poll, Option, and Vote Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the installed `executing-plans` skill to implement this plan inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide shared TypeScript poll structures and reliable per-option vote counts.

**Architecture:** One pure domain module owns the shapes and count derivation. Anonymous votes reference stable option IDs inside their poll. No browser or framework dependency enters the module.

**Tech Stack:** TypeScript, Node 24 built-in test runner, `node:assert/strict`, TypeScript compiler 5.9.3.

**Spec:** [Poll model design](../specs/2026-11-20-issue-2-define-the-poll-option-and-vote-data-model-design.md).

## Global Constraints

- IDs are opaque strings, not labels or array indexes. Renaming or reordering an option preserves its ID.
- There is no persisted count field.
- Readonly properties express caller discipline, not runtime freezing or validation.
- Callers prevent same-browser double-voting later.
- No UI, storage, identity, factories, or app scaffolding belongs to this issue.
- Node 24 supports direct execution of the module's erasable TypeScript.

## Inputs and file responsibilities

Read the linked specification, including its inline visual explanation, and [GLOSSARY.md](../../GLOSSARY.md).
Read `PROJECT_BRIEF.md` and `issues/02-domain-model.md` through `issues/07-validation-empty-states.md` for neighboring scope.
The inspected base is `097cb2aa1d994dc182f1a9083eef41d63a59c436`. It has no app source, package manifest, or tests.

- Create `src/domain/poll.ts`: exported model and pure counting operation.
- Create `tests/poll.test.mjs`: behavioral tests through the public interface.
- Modify `README.md`: model location, example shape, and exact verification commands.
- Preserve `GLOSSARY.md` and planning documents. They already contain the agreed vocabulary and design.

Do not wait for or modify the locked issue #1 worktree. Do not introduce a package manifest solely for this module.
The `.mjs` tests import the `.ts` source directly under Node 24. Source-only compiler checking needs no Node type package.

## Review Focus

Each case belongs to Task 1's behavior tests, not a separate test-only task.

1. Options without votes retain zero counts and input order.
2. Equal or changed labels never merge distinct IDs.
3. Unknown option references raise an error instead of losing a vote.
4. Opaque IDs such as `__proto__` and `constructor` count normally.
5. Frozen and JSON-restored inputs retain their values after counting.

## Visual explanation

One implementation task keeps the model and its behavioral evidence together.

```text
Read spec + glossary
  → write interface tests
  → observe missing-module failure
  → implement src/domain/poll.ts
  → pass tests + strict compiler check
  → document usage and commands
  → commit module, tests, and README
```

## Task 1: Establish the shared poll module

**Files:**
- Create: `src/domain/poll.ts`
- Test: `tests/poll.test.mjs`
- Modify: `README.md`

**Interfaces:**
- Consumes: the specification's four exact TypeScript shapes and counting contract.
- Produces: `PollOption`, `Vote`, `Poll`, `OptionVoteCount`, and `countVotes(poll: Poll): readonly OptionVoteCount[]`.
- Tests import `countVotes` from `../src/domain/poll.ts` and use `node:test` and `node:assert/strict`.
- The module has no runtime dependencies, configuration, or side effects.

- [ ] **Step 1: Write failing interface tests.**

Use a poll with ID `lunch`, question `What is for lunch?`, and these records:

```js
const poll = {
  id: 'lunch',
  question: 'What is for lunch?',
  options: [
    { id: 'soup', label: 'Soup' },
    { id: 'wrap', label: 'Wrap' },
    { id: 'salad', label: 'Salad' },
  ],
  votes: [{ optionId: 'wrap' }, { optionId: 'soup' }, { optionId: 'wrap' }],
};
assert.deepEqual(countVotes(poll), [
  { optionId: 'soup', count: 1 },
  { optionId: 'wrap', count: 2 },
  { optionId: 'salad', count: 0 },
]);
```

Add these named cases in the same test file:

| Test | Required assertions |
| --- | --- |
| `empty poll and no votes` | Empty options and votes return `[]`. Existing options with no votes each return zero. |
| `IDs survive equal labels and reorder` | Set both labels to `Lunch`. Reverse the two options. Results follow reversed IDs and retain their original counts. |
| `polls do not share counts` | Count two polls with the same option ID but different vote arrays. One returns 2 and the other returns 0. |
| `unknown reference raises RangeError` | Append `{ optionId: 'missing' }` after a valid vote. Assert `RangeError`, not partial output. An empty options array with a vote also raises `RangeError`. |
| `opaque IDs are safe` | Use IDs `__proto__` and `constructor`. Give the first two votes and the second none. Assert counts 2 and 0. |
| `frozen input and fresh results` | Freeze the poll, arrays, and each nested object. Counting succeeds, returns distinct arrays and result objects across calls, and preserves a pre-call snapshot. |
| `JSON round trip preserves meaning` | Assert `JSON.parse(JSON.stringify(poll))` equals the original. Count both and compare the results. |

For error cases, also compare the input with a snapshot after the exception.
These tests exercise observable behavior, not field declarations or private helpers.

- [ ] **Step 2: Run the tests before implementation.**

Run: `node --test tests/poll.test.mjs`

Expected: nonzero exit with a missing `src/domain/poll.ts` module error. Record the failure before creating the module.

- [ ] **Step 3: Implement the public module.**

Copy the specification's exact TypeScript declarations into `src/domain/poll.ts`.
Implement `countVotes(poll: Poll): readonly OptionVoteCount[]` with a private counting index.
Preserve option order and zero counts. Reject unknown references with `RangeError`.
Use `Map` for opaque ID safety and linear-time counting. Do not mutate input or export internal helpers.
Caller preconditions remain as specified. Do not add form validation or unknown-JSON parsing.

- [ ] **Step 4: Run the behavioral tests.**

Run: `node --test tests/poll.test.mjs`

Expected: all tests pass, with zero failures. Node 24 needs no TypeScript loader or experimental flag for these declarations.

- [ ] **Step 5: Run the strict source check.**

Run:

```bash
npm exec --yes --package=typescript@5.9.3 -- tsc --noEmit --strict --target ES2022 --module NodeNext --moduleResolution NodeNext src/domain/poll.ts
```

Expected: exit 0 with no diagnostics. This command uses the npm cache or registry without creating repository dependencies.
If the compiler is unavailable, report the tooling blocker. Do not claim an unperformed type check or silently install project scaffolding.

- [ ] **Step 6: Document the shared interface.**

Add a short README section with a JSON-compatible poll example, the module location, and both verification commands.
State the Node 24 prerequisite for direct test execution and npm registry/cache access for the pinned compiler.
Explain that counts derive from votes and double-vote prevention belongs to the later voting flow.
Link the canonical glossary. Preserve the existing demo workflow and source-of-truth notes.

- [ ] **Step 7: Verify the complete deliverable.**

Repeat Steps 4 and 5. Run `git diff --check` and inspect the diff for browser globals and unintended scaffolding.
Expected: all commands exit 0, with changes limited to the module, its tests, README, and authorized planning artifacts.
No build command exists at this base. Do not invent one or add tests that assert documentation text.

- [ ] **Step 8: Commit the implementation.**

```bash
git add src/domain/poll.ts tests/poll.test.mjs README.md
git commit -m "feat: define poll model and derive option vote counts"
```

Do not push from the implementation steps unless the supervising implementation workflow authorizes publication.

## Verification coverage

Task 1 implements every specification acceptance criterion. Compiler checking covers exported declarations, while source inspection confirms no browser dependency.
The behavior cases cover counting, ordering, references, empty states, mutation, key safety, separate polls, and JSON compatibility.
No automated test asserts glossary prose, static configuration, or compiler version text. Documentation uses direct inspection and `git diff --check`.

## Planning review

- Scope: this plan and [the specification](../specs/2026-11-20-issue-2-define-the-poll-option-and-vote-data-model-design.md).
- Reviewer: fresh-context `reviewer`, model `openai-codex/gpt-6.1-sol`, thinking `high`.
- Inspected base: `097cb2aa1d994dc182f1a9083eef41d63a59c436`.
- Reviewed plan body SHA-256: `65ad78d642eb6f4936f3928f22e74d63fccdfe8008eb4519723d0675bc397d21`.
- Compared specification body SHA-256: `1286653b69c0d1bd49dc1991b88e5217d6ad90776e303ad873326ffe83f3268b`.
- Survey: one pure domain module owns the shared model and counts. Tests exercise the public interface without speculative adapters.
- The reviewer independently inspected repository history, neighboring issue ownership, glossary, both explanations, and acceptance-to-task coverage.
- Findings: no blockers or suggestions. No dispositions remain open.
- Limits: no implementation, tests, compiler, installation, or hosting inspection. Scaffold integration and compiler availability remain implementation checks.
- Confirmation: not required because no corrections were requested.
- Record insertion adds one separator newline after each reviewed body. No substantive content changed.
- Final plan body SHA-256: `4390c1fa776455f19aa17943915619bf72e2bb6e847f3615a510e1fad3d6ce58`.
- Final specification body SHA-256: `b1ed23164dbab39ae725d69715ec114fcf17434007ac8f0cf154eff5238b292b`.
- Outcome: `ready`. This records readiness, not maintainer approval.
