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
