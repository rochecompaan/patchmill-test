# Poll, option, and vote model Implementation Plan

> **For agentic workers:** Use [executing-plans](../../.patchmill/skills/executing-plans/SKILL.md) for inline execution. Track steps with checkboxes.

**Goal:** Define one local poll snapshot and derive vote counts per option.

**Architecture:** One pure module owns the poll types and tally rules. Future callers supply snapshots and consume ordered count rows.

**Tech Stack:** TypeScript, Node 24 native TypeScript execution, `node:test`.

**Spec:** [Poll, option, and vote model design](../specs/2026-11-23-issue-2-define-the-poll-option-and-vote-data-model-design.md).

**Plan inputs:** The specification, its inline Visual explanation, and the linked [glossary](../../GLOSSARY.md).

## Global Constraints

- No UI, storage, vote submission, or winner policy.
- No new project dependency or app scaffold. Use Node 24 for the standalone tests.
- All fields and array views are `readonly` at the type level.
- Keep the module independent of the scaffold proposed in PR #13.

## Review Focus

- Repeated votes and duplicate labels: count by stable ID, not by label or array index.
- Reordered options: change row order without changing the count for an ID.
- Stale votes: ignore removed IDs and include options with zero votes.
- Empty collections: return no rows for no options and zero counts for no votes.
- Object-property IDs: treat strings such as `__proto__` as ordinary IDs.

---

### Task 1: Add the poll module and behavior tests

**Files:**
- Create `src/poll.ts`: types and count function.
- Create `tests/poll.test.ts`: direct tests of the exported interface.

**Interfaces:**
- Consumes: no app code or browser APIs.
- Produces: `Poll`, `PollOption`, `Vote`, `OptionVoteCount`, and `countVotes(poll: Poll): readonly OptionVoteCount[]` from `src/poll.ts`. The spec defines each field.

- [ ] **Step 1: Write the behavior tests.**

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countVotes, type Poll } from '../src/poll.ts';

const pizza = { id: '__proto__', label: 'Pizza' };
const otherPizza = { id: 'second', label: 'Pizza' };
const poll: Poll = {
  question: 'What is for lunch?',
  options: [otherPizza, pizza],
  votes: [{ optionId: pizza.id }, { optionId: pizza.id }, { optionId: 'removed' }],
};

const pizzaCount = { optionId: pizza.id, count: 2 };
const otherCount = { optionId: otherPizza.id, count: 0 };

test('counts by ID in option order and ignores stale votes', () => {
  assert.deepEqual(countVotes(poll), [otherCount, pizzaCount]);
  assert.deepEqual(countVotes({ ...poll, options: [pizza, otherPizza] }), [
    pizzaCount, otherCount,
  ]);
});

test('returns zero counts for a new poll and no rows without options', () => {
  assert.deepEqual(countVotes({ ...poll, votes: [] }), [
    otherCount, { optionId: pizza.id, count: 0 },
  ]);
  assert.deepEqual(countVotes({ ...poll, options: [] }), []);
});

test('does not change the poll and produces fresh rows', () => {
  const before = structuredClone(poll);
  const first = countVotes(poll);
  const second = countVotes(poll);
  assert.deepEqual(poll, before);
  assert.notStrictEqual(first, second);
  assert.equal(first.length, poll.options.length);
  assert.equal(second.length, poll.options.length);
  for (const [index, row] of first.entries()) {
    assert.notStrictEqual(row, second[index]);
  }
});
```

- [ ] **Step 2: Add the typed stub in `src/poll.ts`.**

Export the spec types. Export `countVotes(_poll: Poll): readonly OptionVoteCount[]` with a temporary body that returns `[]`.

- [ ] **Step 3: Run the tests before adding the tally.**

Run: `node --test tests/poll.test.ts`

Expected: Nonzero exit with three assertion failures. The stub returns no rows for a poll that has options.

- [ ] **Step 4: Replace the stub with the tally.**

Use a private `Map<string, number>` with one entry per option ID. Seed zero counts, add one per matching vote, then emit rows in option order. Use syntax that Node 24 can erase without a build.

- [ ] **Step 5: Run the behavior tests.**

Run: `node --test tests/poll.test.ts`

Expected: Three tests pass and the command exits zero. These tests protect vote totals that future results code will use.

- [ ] **Step 6: Check the types.**

Run: `npm exec --yes --package=typescript@5.9.3 -- tsc --noEmit --strict --target ES2022 src/poll.ts`

Expected: Exit zero with no diagnostics. This version matches the proposed scaffold and runs from the npm cache or registry. This command does not add a project dependency.

- [ ] **Step 7: Inspect the change.**

Check the fields against the spec and check that the snapshot contains only JSON data. Check that the module has no I/O and that the change touches no UI or scaffold files. No automated test is necessary for static documentation or configuration.

- [ ] **Step 8: Commit the deliverable.**

```bash
git add src/poll.ts tests/poll.test.ts
git diff --cached --check
git commit -m "feat: define the lunch poll data model"
```

Expected: The diff check reports no whitespace errors and the commit contains only the model and its tests.

Task completion command: `node --test tests/poll.test.ts`.

## Visual explanation

```text
tests/poll.test.ts owns the expected counts
              │ red: assertions fail against src/poll.ts stub
              ▼
src/poll.ts gains the tally rules
              │ green: same tests use the real tally
              ▼
Type-check the module → inspect the change → commit
```
## Planning review

Combined scope for both passes: this plan and the [specification](../specs/2026-11-23-issue-2-define-the-poll-option-and-vote-data-model-design.md).

Reviewer for both passes: `reviewer`, `openai-codex/gpt-6.2-sol`, `xhigh`. Base: `4eb64b6d8bf5a9d23d1a9fe7cfa2dbb498918a2a`.

**Initial pass.** Reviewed plan body: `444e61ce2676aa01745f1ecbc4edb07073dc9b81447d6443e156b78ae43ff42d`. Compared spec body: `2d22c050ef2cb400066beb186a1fa3df66a56b1b732120fbfefa4c0f98c35b3e`.

The reviewer found no app source, test suite, or package manifest on the base. The tests use the pure tally interface directly. Findings:

- B1 (plan blocker), **Accepted**: Add the typed stub before RED. Expect failed assertions and show that sequence in the diagram.
- S1 (spec suggestion), **Accepted**: Forbid reuse of an option ID while stale votes still reference it.
- S2 (plan suggestion), **Accepted**: Check result lengths and freshness of every row.

**Scoped confirmation.** The reviewer found all three corrections complete. Node 24 probes showed three assertion failures against the stub and three passes against a representative tally. A probe that reused the second row failed the freshness test. The reviewer inspected both inline diagrams and local links. The probes used virtual modules. The file-backed suite and TypeScript check remain implementation steps. The reviewer did not query live issue or PR metadata.

Final plan body: `e5359ead38930c53574b6f6686483b665fc7290d96995d27eb513c99cf97d2ef`. Compared final spec body: `d1c0237a71898acf2d18bba3997c6ca6fd638583af2ea6a15b920b8598155281`. Outcome: `ready`.
