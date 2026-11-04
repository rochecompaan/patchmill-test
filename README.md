# Team Lunch Poll

Team Lunch Poll is a small greenfield demo app for trying Patchmill on a safe,
disposable repository.

The product will let a team create a lunch poll, add meal or restaurant options,
vote on those options, and see the current winner. The current app is a responsive
shell with placeholders for poll creation and results. Poll creation, voting,
and results are not available yet. Later seeded issues add those features.

## Local development

Use Node.js 24 LTS and npm 11. The app uses Vite and plain TypeScript. It needs
no backend, secrets, or environment file.

From the repository root, install dependencies:

```bash
npm install
```

For a fresh checkout, install the versions in the committed lockfile:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open the local URL that Vite prints. Press Ctrl+C to stop the server.

## Checks and production build

Run strict TypeScript checks:

```bash
npm run check
```

Create a production build:

```bash
npm run build
```

The build runs TypeScript checks before Vite writes the output to `dist/`.
Checks currently cover type checking and production compilation, not an
automated behavior suite. There is no test framework for this static scaffold.

After a successful build, inspect the production app locally:

```bash
npm run preview
```

Open the URL that Vite prints. Press Ctrl+C to stop the preview server.
The preview server needs an existing build and is not a production server.

Git ignores `node_modules/` and `dist/`.

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
