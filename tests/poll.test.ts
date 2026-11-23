import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countVotes, createPoll, type Poll } from '../src/poll.ts';

test('rejects a blank question before checking options', () => {
  assert.deepEqual(createPoll(' \t ', []), { ok: false, reason: 'question-required' });
});

test('rejects fewer than two nonblank options', () => {
  assert.deepEqual(createPoll('Lunch?', ['Pizza', ' \t ']), {
    ok: false, reason: 'options-required',
  });
});

test('creates a poll with exactly two options', () => {
  const result = createPoll('Lunch?', ['Pizza', 'Tacos']);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.poll.options.map(({ label }) => label), ['Pizza', 'Tacos']);
});

test('trims text, skips blanks, and assigns distinct IDs in input order', () => {
  const options = Object.freeze([' Pizza ', '  ', 'Tacos', 'Pizza', '']);
  const expected = {
    ok: true, poll: {
      question: 'Lunch?',
      options: [
        { id: 'option-1', label: 'Pizza' },
        { id: 'option-2', label: 'Tacos' },
        { id: 'option-3', label: 'Pizza' },
      ],
      votes: [],
    },
  };
  const first = createPoll(' Lunch? ', options);
  const second = createPoll(' Lunch? ', options);
  assert.deepEqual(first, expected);
  assert.deepEqual(second, expected);
  if (first.ok && second.ok) assert.notStrictEqual(first.poll, second.poll);
});

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
