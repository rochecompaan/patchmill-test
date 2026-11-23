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
