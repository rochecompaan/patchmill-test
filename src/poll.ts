export interface PollOption {
  id: string;
  label: string;
}

export interface Vote {
  optionId: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  votes: Vote[];
}

export function countVotesForOption(poll: Poll, optionId: string): number {
  if (!poll.options.some((option) => option.id === optionId)) {
    return 0;
  }

  return poll.votes.filter((vote) => vote.optionId === optionId).length;
}
