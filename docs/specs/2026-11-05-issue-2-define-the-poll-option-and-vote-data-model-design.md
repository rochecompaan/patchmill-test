# Poll, option, and vote data model

## Intent

Define the shared model for Team Lunch Poll. Future issues will use it for poll forms, voting, local storage, and results.

Issue: https://github.com/rochecompaan/patchmill-test/issues/2

## Context and decisions

The app uses plain TypeScript and Vite. `src/main.ts` currently imports only the stylesheet. No domain model or behavior tests exist.

The maintainer accepted the recommendation for anonymous vote records. The choices that follow are planning defaults for the small, local-only model.

### Approaches

- **Nested poll aggregate (selected):** A poll owns its options and votes. One JSON-compatible value fits local browser state without joins.
- **Separate collections:** Polls, options, and votes each have their own collection. This supports database-style relationships but adds unnecessary bookkeeping now.
- **Counters on options:** This uses less data but loses individual vote records. Separate counters also create a second source of truth.

Use the nested aggregate with stable string IDs. Derive counts from vote records, not stored totals.

## Model contract

Create `src/poll.ts` with these exported interfaces:

```typescript
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
```

A poll owns both arrays. Their order remains intact. Option IDs are unique within a poll and remain stable after label changes.

A vote references an option in its containing poll. It needs no poll ID, voter identity, timestamp, or independent ID in this version.

Each record represents one vote for one option. Repeated records count separately. They can represent different anonymous teammates.

Callers provide nonempty IDs and meaningful question and label text. IDs are opaque strings, not array indexes or labels.

This module does not generate IDs or validate arbitrary input. Future forms and storage code must enforce creation and loading rules.

Empty options and votes arrays are valid model states. This supports initial state without imposing form validation rules on this issue.

All fields use JSON-compatible values. Serialization preserves the model without custom classes or conversion logic.

## Count helper

Export `countVotesForOption(poll: Poll, optionId: string): number` from `src/poll.ts`.

- Return the number of vote records that reference the requested option ID.
- Return zero if the requested option is absent from `poll.options`.
- Return zero for an option without votes.
- Ignore votes for unknown options. Such records never produce a visible option total.
- Compare IDs exactly, with case-sensitive string equality.
- Do not modify the poll, its arrays, or its records.
- Do not use labels as keys or infer a winning option.

The helper accepts a structurally valid `Poll`. It does not parse malformed JSON or repair invalid field types.

## Scope boundaries

Include the interfaces, count helper, focused behavior tests, and a short README reference to the shared module.

Do not add forms, vote actions, winner logic, storage, authentication, session markers, timestamps, or an app-state container.

A later voting issue owns browser-session double-vote prevention. A later results issue owns winner and tie behavior.

Keep `src/main.ts`, the HTML, and CSS unchanged. Do not add production dependencies or a test framework.

Use Node.js 24 LTS and npm 11, as required by the existing project.

## Frontend design

Frontend design does not apply. This issue adds a domain contract and pure computation without browser-visible changes. No mockup is required.

## Acceptance and verification

1. Strict TypeScript checks accept the exported model and helper.
2. Empty polls and options without votes return zero.
3. Repeated vote records produce the correct option totals.
4. Different IDs with identical labels remain independent.
5. Unknown references do not inflate known totals or produce totals for missing options.
6. Case-sensitive and special string IDs work without object-key assumptions.
7. Counts remain correct after a JSON round trip and do not mutate input.
8. The production build still succeeds without UI changes.

Use Node's built-in test runner for meaningful counting tests. Do not add tests that only inspect interface text or documentation.
