import type { Poll } from './poll';

const key = 'team-lunch-poll:v1';
type PollStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type LoadResult =
  | { kind: 'loaded'; poll: Poll }
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'unavailable' };

interface PollStore {
  load(): LoadResult;
  save(poll: Poll): boolean;
  clear(): boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonblank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPoll(value: unknown): value is Poll {
  if (!isRecord(value) || !isNonblank(value.question)) return false;
  const { options, votes } = value;
  if (!Array.isArray(options) || options.length < 2 || !Array.isArray(votes) || votes.length > 1) {
    return false;
  }

  const ids = new Set<string>();
  for (const option of options) {
    if (!isRecord(option) || !isNonblank(option.label) || !isNonblank(option.id) || ids.has(option.id)) {
      return false;
    }
    ids.add(option.id);
  }
  return votes.every((vote: unknown) =>
    isRecord(vote) && typeof vote.optionId === 'string' && ids.has(vote.optionId));
}

export function createPollStore(getStorage: () => PollStorage): PollStore {
  return {
    load() {
      let raw: string | null;
      try {
        raw = getStorage().getItem(key);
      } catch {
        return { kind: 'unavailable' };
      }
      if (raw === null) return { kind: 'empty' };

      try {
        const snapshot: unknown = JSON.parse(raw);
        if (isPoll(snapshot)) return { kind: 'loaded', poll: snapshot };
      } catch {
        return { kind: 'invalid' };
      }
      return { kind: 'invalid' };
    },
    save(poll) {
      try {
        getStorage().setItem(key, JSON.stringify(poll));
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      try {
        getStorage().removeItem(key);
        return true;
      } catch {
        return false;
      }
    },
  };
}
