export interface Poll {
  readonly question: string;
  readonly options: readonly PollOption[];
  readonly votes: readonly Vote[];
}

export interface PollOption {
  readonly id: string;
  readonly label: string;
}

export interface Vote {
  readonly optionId: string;
}

export interface OptionVoteCount {
  readonly optionId: string;
  readonly count: number;
}

export interface PollResults {
  readonly counts: readonly OptionVoteCount[];
  readonly leadingOptionIds: readonly string[];
}

export type CreatePollResult =
  | { ok: true; poll: Poll }
  | { ok: false; reason: 'question-required' | 'options-required' };

export function createPoll(question: string, optionLabels: readonly string[]): CreatePollResult {
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion) return { ok: false, reason: 'question-required' };

  const options: PollOption[] = [];
  for (const input of optionLabels) {
    const label = input.trim();
    if (label) options.push({ id: `option-${options.length + 1}`, label });
  }
  if (options.length < 2) return { ok: false, reason: 'options-required' };

  return { ok: true, poll: { question: trimmedQuestion, options, votes: [] } };
}

export type CastVoteResult =
  | { ok: true; poll: Poll }
  | { ok: false; reason: 'unknown-option' };

export function castVote(poll: Poll, optionId: string): CastVoteResult {
  if (!poll.options.some(({ id }) => id === optionId)) {
    return { ok: false, reason: 'unknown-option' };
  }
  return { ok: true, poll: { ...poll, votes: [...poll.votes, { optionId }] } };
}

export function countVotes(poll: Poll): readonly OptionVoteCount[] {
  const counts = new Map<string, number>();
  for (const { id } of poll.options) {
    counts.set(id, 0);
  }

  for (const { optionId } of poll.votes) {
    const count = counts.get(optionId);
    if (count !== undefined) {
      counts.set(optionId, count + 1);
    }
  }

  return Array.from(counts, ([optionId, count]) => ({ optionId, count }));
}

export function getPollResults(poll: Poll): PollResults {
  const counts = countVotes(poll);
  let highest = 0;
  for (const { count } of counts) highest = Math.max(highest, count);

  const leadingOptionIds = highest > 0
    ? counts.filter(({ count }) => count === highest).map(({ optionId }) => optionId)
    : [];
  return { counts, leadingOptionIds };
}
