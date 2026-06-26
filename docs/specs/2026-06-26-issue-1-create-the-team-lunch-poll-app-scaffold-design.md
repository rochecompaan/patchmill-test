# Design Spec: Team Lunch Poll App Scaffold

## Issue

- Issue: #1, "Create the Team Lunch Poll app scaffold"
- Labels: feature, agent-ready

## Context

Team Lunch Poll is a greenfield demo web app for teams to decide what or where to eat together. The repository currently contains project documentation and seeded issue prompts only, so this issue should establish a TypeScript-friendly app foundation that later poll creation, voting, results, persistence, validation, and responsive polish work can build on.

`AGENTS.md` was requested but is not present in the repository; the spec is based on `README.md`, `PROJECT_BRIEF.md`, and `issues/01-project-scaffold.md`.

## Requirements

- Create an initial web app scaffold using a simple TypeScript-friendly setup.
- Provide a minimal app shell with:
  - a clear Team Lunch Poll heading,
  - a short product description,
  - a placeholder area for future poll creation and results UI.
- Keep the first scaffold local, lightweight, and easy to run.
- Document commands to:
  - install dependencies,
  - run the app locally,
  - run checks.
- Avoid adding backend services, authentication, deployment setup, or product behavior beyond the scaffold.

## Proposed Design

Use a small Vite + React + TypeScript app because it is TypeScript-first, common, fast to run locally, and suitable for later component-driven product work. The scaffold should include the standard project files needed for dependency management, development server execution, build/check commands, and a single starter app shell.

The initial UI should be static. It should introduce the product and reserve obvious space for the next features without implementing poll creation, voting, or result calculations. The placeholder copy should make it clear that poll creation and live results will appear there in later work.

## Proposed Behavior

When a contributor installs dependencies and starts the local dev server, the browser should show:

- A page headed "Team Lunch Poll".
- A brief description explaining that the app helps teammates choose a lunch option together.
- A visually distinct placeholder section for upcoming poll creation and results.

The app should not persist data, accept poll input, record votes, calculate winners, call a backend, or require login as part of this issue.

## Affected Components

Expected implementation areas for the later coding step:

- Project package/configuration files for the TypeScript-friendly app scaffold.
- Source entrypoint and root app component for the static shell.
- Basic styling for readable desktop and mobile presentation.
- README documentation for install, local development, and checks.

## Verification Strategy

The implementation should be considered complete when:

- Dependencies install successfully using the documented install command.
- The documented local development command starts the app without errors.
- The app renders the heading, description, and placeholder area.
- The documented check command succeeds.
- README instructions match the actual commands in the project configuration.

Manual browser verification is sufficient for this scaffold issue unless the selected tooling includes a lightweight automated check by default.
