# Poll Data Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan inline, task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small shared poll model with anonymous votes and reliable per-option counts.

**Architecture:** A poll owns ordered options and anonymous vote records. A pure helper derives counts from those records. The module has no browser or storage dependencies.

**Tech Stack:** Existing TypeScript and Vite, Node.js 24 LTS, npm 11, and Node's built-in test runner.

**Spec:** [Poll, option, and vote model](../specs/2026-11-05-issue-2-define-the-poll-option-and-vote-data-model-design.md)

## Global Constraints

- Use Node.js 24 LTS and npm 11, as required by the existing project.
- Do not add production dependencies or a test framework.
- Keep `src/main.ts`, the HTML, and CSS unchanged.
- IDs are opaque strings, not array indexes or labels.
- The helper accepts a structurally valid `Poll`.
- A later voting issue owns browser-session double-vote prevention.
- A later results issue owns winner and tie behavior.

## Review Focus

These risks receive explicit assertions in Task 1:

1. Empty state: an empty poll and an option without votes return zero.
2. Identity: identical labels do not combine totals, and case-distinct IDs remain distinct.
3. Stale references: unknown votes do not affect known totals or make absent options countable.
4. Anonymous repeats: repeated records count separately instead of deduplication by option.
5. Local state: JSON round trips preserve counts, special string IDs work, and counting does not mutate input.

## File map and verification choice

- Create `src/poll.ts`: exported domain interfaces and the count helper.
- Create `tests/poll.test.ts`: focused behavior tests with `node:test` and `node:assert/strict`.
- Modify `package.json`: add `"test": "node --test tests/*.test.ts"`.
- Modify `README.md`: describe the domain module and test command.

Node.js 24 can run these TypeScript tests directly through built-in type stripping. Use `import type` for `Poll` and import the helper from `../src/poll.ts`.

Keep tests outside `src` so the current browser TypeScript configuration remains unchanged. Runtime tests use Node APIs without new type dependencies.

The Testing Value Gate selects tests for count behavior and state preservation. Interface names and document content need direct inspection, not text-assertion tests.

Run `npm run check` for source types and `npm run build` for production compilation. No mockup or screenshot verification applies.

---

### Task 1: Deliver the shared model and count helper

**Files:** All four files in the file map.

**Interfaces:**
- Consumes: no existing domain code.
- Produces: `PollOption { id: string; label: string }`.
- Produces: `Vote { optionId: string }`.
- Produces: `Poll { id: string; question: string; options: PollOption[]; votes: Vote[] }`.
- Produces: `countVotesForOption(poll: Poll, optionId: string): number`.

- [ ] **Step 1: Install existing dependencies.**

Run `npm ci`. Expect a successful install from the existing lockfile without dependency edits.

- [ ] **Step 2: Write the behavior tests and add the test script.**

Use a typed fixture with poll ID `lunch-1` and question `Where for lunch?`.
Use options `{ id: 'a', label: 'Cafe' }`, `{ id: 'b', label: 'Cafe' }`, and `{ id: 'c', label: 'Deli' }`.
Use votes with option IDs `a`, `b`, `a`, and `missing`.

Add named tests with these assertions:

| Test | Exact assertions |
| --- | --- |
| `counts anonymous records by option ID` | Fixture totals for `a`, `b`, `c` equal `2`, `1`, `0`. |
| `returns zero for empty state` | Empty options and votes return `0` for `a`. An option `a` with no votes returns `0`. |
| `ignores unknown option references` | Fixture total for `missing` is `0`, despite its vote record. Total for `a` stays `2`. |
| `compares opaque IDs exactly` | Options `A`, `a`, and `__proto__`, with one vote for `A` and two for `__proto__`, yield `1`, `0`, `2`. |
| `preserves serializable local state` | A JSON round trip of the fixture is deeply equal to the fixture and still returns `2` for `a`. |
| `does not mutate the poll` | Freeze every fixture record, both arrays, and the poll. Count `a` as `2` and compare with an independent pre-call JSON snapshot. |

Use `assert.equal` for totals and `assert.deepEqual` for state comparisons.

- [ ] **Step 3: Run the tests before implementation.**

Run `npm test`. Expect a nonzero exit because `src/poll.ts` does not exist. Do not treat a runner configuration error as the intended red result.

- [ ] **Step 4: Implement the model and helper.**

Create the three exported interfaces exactly as the spec defines them.
Implement `countVotesForOption(poll: Poll, optionId: string): number`.
First determine whether the option exists, then count exact vote references. Return zero for absent options without altering input.
Do not add ID generation, input parsing, stored totals, or winner logic.

- [ ] **Step 5: Run the behavior tests.**

Run `npm test`. Expect all six tests to pass with no failures.

- [ ] **Step 6: Document the public contract.**

Add a short domain-model section to `README.md`. Identify `src/poll.ts`, the three exported interfaces, anonymous records, and derived counts.
Add `npm test` to the checks section. Replace the scaffold statement that no behavior suite exists with the new suite's actual scope.
Keep the description clear that forms, voting UI, and results remain unavailable.

- [ ] **Step 7: Verify types, build, and scope.**

Run `npm run check` and `npm run build`. Expect exit code zero for both commands.
Run `git diff --check`. Expect no whitespace errors.
Inspect the diff for exact exported names, unchanged UI files, and no dependency additions.

- [ ] **Step 8: Commit the deliverable.**

```bash
git add src/poll.ts tests/poll.test.ts package.json README.md
git commit -m "feat: define poll option and vote model"
```

## Self-review and handoff

The single task covers every acceptance criterion. Each review risk maps to an explicit behavior assertion.
The specification is the only planning input. No frontend mockup applies.
Implementation runs inline through `executing-plans` in the supplied issue worktree. Planning does not implement the task or open a separate planning pull request.
