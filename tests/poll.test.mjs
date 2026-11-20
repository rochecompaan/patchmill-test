import assert from 'node:assert/strict';
import test from 'node:test';
import { countVotes } from '../src/domain/poll.ts';

function lunchPoll() {
  return {
    id: 'lunch',
    question: 'What is for lunch?',
    options: [
      { id: 'soup', label: 'Soup' },
      { id: 'wrap', label: 'Wrap' },
      { id: 'salad', label: 'Salad' },
    ],
    votes: [{ optionId: 'wrap' }, { optionId: 'soup' }, { optionId: 'wrap' }],
  };
}

test('counts repeated selections and retains zero counts in option order', () => {
  assert.deepEqual(countVotes(lunchPoll()), [
    { optionId: 'soup', count: 1 },
    { optionId: 'wrap', count: 2 },
    { optionId: 'salad', count: 0 },
  ]);
});

test('empty poll and no votes', () => {
  assert.deepEqual(countVotes({ ...lunchPoll(), options: [], votes: [] }), []);
  assert.deepEqual(countVotes({ ...lunchPoll(), votes: [] }), [
    { optionId: 'soup', count: 0 },
    { optionId: 'wrap', count: 0 },
    { optionId: 'salad', count: 0 },
  ]);
});

test('IDs survive equal labels and reorder', () => {
  const poll = lunchPoll();
  poll.options = [
    { id: 'soup', label: 'Lunch' },
    { id: 'wrap', label: 'Lunch' },
  ];
  assert.deepEqual(countVotes(poll), [
    { optionId: 'soup', count: 1 },
    { optionId: 'wrap', count: 2 },
  ]);
  poll.options.reverse();
  assert.deepEqual(countVotes(poll), [
    { optionId: 'wrap', count: 2 },
    { optionId: 'soup', count: 1 },
  ]);
});

test('polls do not share counts', () => {
  const first = {
    ...lunchPoll(),
    options: [{ id: 'wrap', label: 'Wrap' }],
    votes: [{ optionId: 'wrap' }, { optionId: 'wrap' }],
  };
  const second = { ...first, id: 'tomorrow', votes: [] };
  assert.deepEqual(countVotes(first), [{ optionId: 'wrap', count: 2 }]);
  assert.deepEqual(countVotes(second), [{ optionId: 'wrap', count: 0 }]);
  assert.deepEqual(countVotes(first), [{ optionId: 'wrap', count: 2 }]);
});

test('unknown reference raises RangeError', () => {
  for (const poll of [
    { ...lunchPoll(), votes: [{ optionId: 'wrap' }, { optionId: 'missing' }] },
    { ...lunchPoll(), options: [], votes: [{ optionId: 'missing' }] },
  ]) {
    const snapshot = structuredClone(poll);
    assert.throws(() => countVotes(poll), RangeError);
    assert.deepEqual(poll, snapshot);
  }
});

test('opaque IDs are safe', () => {
  const poll = {
    ...lunchPoll(),
    options: [
      { id: '__proto__', label: 'Soup' },
      { id: 'constructor', label: 'Wrap' },
    ],
    votes: [{ optionId: '__proto__' }, { optionId: '__proto__' }],
  };
  assert.deepEqual(countVotes(poll), [
    { optionId: '__proto__', count: 2 },
    { optionId: 'constructor', count: 0 },
  ]);
});

test('frozen input and fresh results', () => {
  const poll = lunchPoll();
  const snapshot = structuredClone(poll);
  for (const value of [...poll.options, ...poll.votes]) Object.freeze(value);
  Object.freeze(poll.options);
  Object.freeze(poll.votes);
  Object.freeze(poll);

  const first = countVotes(poll);
  const second = countVotes(poll);
  assert.deepEqual(first, [
    { optionId: 'soup', count: 1 },
    { optionId: 'wrap', count: 2 },
    { optionId: 'salad', count: 0 },
  ]);
  assert.deepEqual(second, first);
  assert.notStrictEqual(first, second);
  for (let i = 0; i < first.length; i += 1) {
    assert.notStrictEqual(first[i], second[i]);
    assert.notStrictEqual(first[i], poll.options[i]);
  }
  assert.deepEqual(poll, snapshot);
});

test('JSON round trip preserves meaning', () => {
  const poll = lunchPoll();
  const restored = JSON.parse(JSON.stringify(poll));
  assert.deepEqual(restored, poll);
  assert.deepEqual(countVotes(restored), [
    { optionId: 'soup', count: 1 },
    { optionId: 'wrap', count: 2 },
    { optionId: 'salad', count: 0 },
  ]);
  assert.deepEqual(countVotes(restored), countVotes(poll));
});
