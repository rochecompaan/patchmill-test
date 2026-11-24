# Team Lunch Poll

Team Lunch Poll is a small greenfield demo app for trying Patchmill on a safe,
disposable repository.

The app should let a team create a lunch poll, add meal or restaurant options,
vote on those options, and see the current winner. The repository intentionally
starts with documentation and issue prompts only. Patchmill agents should build
the application from the seeded issues.

## Run the app locally

Use Node.js 24 LTS and npm 11. From the repository root, install the locked
dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open the local URL Vite prints. Enter a poll question and at least two lunch
options. Use **Add option** for more choices, then **Save poll** to show the
poll. Choose **Vote** next to one option. The poll confirms your choice and
locks all vote buttons, so you can vote only once in that poll. The page holds
one poll at a time, and reloading clears it. Your browser can warn before you
leave an unsaved draft.

Results show zero votes for each option when you save the poll and update each
option's count immediately after you vote. Results highlight a sole current
leader or report a tie when options share the highest positive count. The
one-vote limit means a tie cannot occur in this browser flow.

Run `npm run check` from the repository root to type-check without emitting
JavaScript and build the production app. After the build, run `npm run preview`
to serve the production output locally.

## Demo workflow

After this repository is seeded, try Patchmill manually:

```bash
patchmill init
patchmill triage --dry-run
patchmill triage
```

## Source of truth

This repository is disposable. The reusable project brief and issue prompts live
in the Patchmill package under `fixtures/patchmill-test-repo/`.
