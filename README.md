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

Open the local URL Vite prints. The app currently shows a placeholder for poll
creation and results; neither feature is implemented yet.

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
