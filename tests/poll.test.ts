import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countVotesForOption } from '../src/poll.ts';
import type { Poll } from '../src/poll.ts';

function createPoll(): Poll {
  return {
    id: 'lunch-1',
    question: 'Where for lunch?',
    options: [
      { id: 'a', label: 'Cafe' },
      { id: 'b', label: 'Cafe' },
      { id: 'c', label: 'Deli' },
    ],
    votes: [
      { optionId: 'a' },
      { optionId: 'b' },
      { optionId: 'a' },
      { optionId: 'missing' },
    ],
  };
}

test('counts anonymous records by option ID', () => {
  const poll = createPoll();

  assert.equal(countVotesForOption(poll, 'a'), 2);
  assert.equal(countVotesForOption(poll, 'b'), 1);
  assert.equal(countVotesForOption(poll, 'c'), 0);
});

test('returns zero for empty state', () => {
  const poll: Poll = {
    id: 'lunch-1',
    question: 'Where for lunch?',
    options: [],
    votes: [],
  };

  assert.equal(countVotesForOption(poll, 'a'), 0);
  poll.options.push({ id: 'a', label: 'Cafe' });
  assert.equal(countVotesForOption(poll, 'a'), 0);
});

test('ignores unknown option references', () => {
  const poll = createPoll();

  assert.equal(countVotesForOption(poll, 'missing'), 0);
  assert.equal(countVotesForOption(poll, 'a'), 2);
});

test('compares opaque IDs exactly', () => {
  const poll: Poll = {
    id: 'lunch-1',
    question: 'Where for lunch?',
    options: [
      { id: 'A', label: 'Cafe' },
      { id: 'a', label: 'Cafe' },
      { id: '__proto__', label: 'Deli' },
    ],
    votes: [
      { optionId: 'A' },
      { optionId: '__proto__' },
      { optionId: '__proto__' },
    ],
  };

  assert.equal(countVotesForOption(poll, 'A'), 1);
  assert.equal(countVotesForOption(poll, 'a'), 0);
  assert.equal(countVotesForOption(poll, '__proto__'), 2);
});

test('preserves serializable local state', () => {
  const poll = createPoll();
  const restored: Poll = JSON.parse(JSON.stringify(poll));

  assert.deepEqual(restored, poll);
  assert.equal(countVotesForOption(restored, 'a'), 2);
});

test('does not mutate the poll', () => {
  const poll = createPoll();
  const snapshot = JSON.parse(JSON.stringify(poll));
  poll.options.forEach(Object.freeze);
  poll.votes.forEach(Object.freeze);
  Object.freeze(poll.options);
  Object.freeze(poll.votes);
  Object.freeze(poll);

  assert.equal(countVotesForOption(poll, 'a'), 2);
  assert.deepEqual(poll, snapshot);
});
