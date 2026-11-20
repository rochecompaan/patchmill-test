export interface PollOption {
  readonly id: string;
  readonly label: string;
}

export interface Vote {
  readonly optionId: string;
}

export interface Poll {
  readonly id: string;
  readonly question: string;
  readonly options: readonly PollOption[];
  readonly votes: readonly Vote[];
}

export interface OptionVoteCount {
  readonly optionId: string;
  readonly count: number;
}

/**
 * Derive counts in option order without changing the poll.
 * Callers supply well-typed data with unique, stable option IDs within the poll.
 * Throws RangeError if a vote references an unknown option.
 * Runs in O(options + votes) time with O(options) auxiliary space.
 */
export function countVotes(poll: Poll): readonly OptionVoteCount[] {
  const counts = new Map(poll.options.map(({ id }) => [id, 0]));

  for (const vote of poll.votes) {
    const count = counts.get(vote.optionId);
    if (count === undefined) {
      throw new RangeError(`Vote references unknown option: ${vote.optionId}`);
    }
    counts.set(vote.optionId, count + 1);
  }

  return poll.options.map(({ id }) => ({ optionId: id, count: counts.get(id)! }));
}
