# Team Lunch Poll

Team Lunch Poll is a small greenfield demo app for trying Patchmill on a safe,
disposable repository.

The app should let a team create a lunch poll, add meal or restaurant options,
vote on those options, and see the current winner. The repository intentionally
starts with documentation and issue prompts only. Patchmill agents should build
the application from the seeded issues.

## Run the app locally

Use Node.js 24 LTS and npm 11. Run all commands from the repository root.
No environment file, global Vite installation, or external service is required.

Install the committed dependency versions:

```bash
npm ci
```

For an initial dependency setup or intentional dependency updates, use `npm install` instead.
Commit the resulting `package-lock.json` after an update.

Start the development server:

```bash
npm run dev
```

Open the local URL that Vite prints in the terminal. Stop the server with Ctrl+C.

The current app is a static scaffold with placeholders for poll creation and results.
Poll creation, voting, and data storage are not available yet.

## Run checks

Run the strict TypeScript check:

```bash
npm run check
```

Build the production app:

```bash
npm run build
```

The build runs the type check first, then writes the production assets to `dist/`.
Checks currently cover type checking and production bundling. There is no automated behavior suite yet.

After a successful build, inspect the production app locally:

```bash
npm run preview
```

Open the URL that Vite prints. Stop the preview server with Ctrl+C.

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
