# Team Lunch Poll

Team Lunch Poll is a small greenfield demo app for trying Patchmill on a safe,
disposable repository.

The app helps a team create a lunch poll, add meal or restaurant options, vote
on those options, and see the current winner. The repository intentionally
starts from seeded issues and grows feature by feature.

## Local development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Run checks before submitting changes:

```bash
npm run check
```

The check command runs TypeScript validation and a production build.

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
