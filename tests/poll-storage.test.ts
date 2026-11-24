import assert from 'node:assert/strict';
import test from 'node:test';
import { createPollStore } from '../src/poll-storage.ts';

const key = 'team-lunch-poll:v1';
const poll = {
  question: 'Lunch?',
  options: [{ id: 'option-9', label: 'Pizza' }, { id: 'option-3', label: 'Pizza' }],
  votes: [{ optionId: 'option-3' }],
};

function fixture() {
  const map = new Map<string, string>();
  const storage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value); },
    removeItem: (key: string) => { map.delete(key); },
  };
  return { map, open: () => createPollStore(() => storage) };
}

test('round-trips ordered options and the selected ID across store instances', () => {
  const { open } = fixture();
  const store = open();
  assert.deepEqual(store.load(), { kind: 'empty' });
  for (const snapshot of [{ ...poll, votes: [] }, poll]) {
    assert.equal(store.save(snapshot), true);
    assert.deepEqual(open().load(), { kind: 'loaded', poll: snapshot });
  }
});

test('rejects corrupt or unsupported snapshots without erasing them', () => {
  const { map, open } = fixture();
  const store = open();
  const invalid = [
    null,
    { ...poll, question: ' ' },
    { ...poll, options: [poll.options[0], { ...poll.options[1], label: ' ' }] },
    { ...poll, options: [{ ...poll.options[0], id: '' }, poll.options[1]] },
    { ...poll, options: poll.options.slice(0, 1) },
    { ...poll, options: [poll.options[1], poll.options[1]] },
    { ...poll, votes: poll.votes[0] },
    { ...poll, votes: [{ optionId: 'Option-3' }] },
    { ...poll, votes: [...poll.votes, { optionId: 'option-9' }] },
  ];
  for (const raw of ['{', ...invalid.map((value) => JSON.stringify(value))]) {
    map.set(key, raw);
    assert.deepEqual(store.load(), { kind: 'invalid' }, raw);
    assert.equal(map.get(key), raw);
  }
});

test('clear removes only the current poll and succeeds when it is already absent', () => {
  const { map, open } = fixture();
  map.set(key, JSON.stringify(poll));
  map.set('unrelated', 'keep');
  const store = open();
  assert.equal(store.clear(), true);
  assert.deepEqual(store.load(), { kind: 'empty' });
  assert.equal(map.get('unrelated'), 'keep');
  assert.equal(store.clear(), true);
});

test('reports storage accessor and method failures without throwing', () => {
  const fail = () => { throw new Error('Storage unavailable'); };
  for (const getStorage of [fail, () => ({ getItem: fail, setItem: fail, removeItem: fail })]) {
    const store = createPollStore(getStorage);
    assert.deepEqual(store.load(), { kind: 'unavailable' });
    assert.equal(store.save(poll), false);
    assert.equal(store.clear(), false);
  }
});
