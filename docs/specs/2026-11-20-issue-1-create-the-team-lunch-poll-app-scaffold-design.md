# Team Lunch Poll scaffold design

## Intent and scope

Issue #1 gives contributors a working browser app before later issues add poll behavior.
The repository currently contains only `README.md`, `PROJECT_BRIEF.md`, and issue prompts.
The inspected base is `097cb2aa1d994dc182f1a9083eef41d63a59c436`.
No source, tests, package configuration, repository instructions, glossary, or ADR exists in this worktree.

Deliver a single static page, a TypeScript development setup, and contributor commands.
Do not implement poll creation, voting, results calculation, storage, routing, authentication, a backend, or deployment.
Do not add sample votes, fake results, inactive buttons, or framework demo assets.

## Approaches

The issue delegates the setup choice. These are planner decisions, not prior maintainer approvals.

- **Vite, plain TypeScript, and CSS (chosen):** small dependency surface for a static shell, with direct browser interfaces.
- **Vite and React:** useful for later stateful screens, but unnecessary runtime and conventions for this issue.
- **TypeScript without a development server:** fewer tools, but contributors must arrange compilation and asset serving themselves.

Use Node.js 24 LTS and npm 11. Choose stable Vite and TypeScript releases compatible with that runtime during implementation.
Commit `package-lock.json` so contributors install the same dependency versions.
Use strict TypeScript with DOM types, ES modules, and no emitted TypeScript output during checks.
No CSS framework, remote fonts, icons, or runtime dependencies are necessary.

## Page and visual design

Frontend design applies because this issue creates the browser-visible layout and styling.
Keep the scope minimal despite generic guidance that favors elaborate visual treatments.
Use a lunch-menu motif: one dark-green heading rule and a quiet, pale-green workspace.
Avoid a dashboard, promotional hero, repeated cards, and decorative animation.

Tokens:

- Paper: `#FFFFFF` for the page.
- Ink: `#18352C` for primary text and the heading rule.
- Secondary ink: `#425C52` for descriptions.
- Workspace: `#F0F7F2` for the placeholder background.
- Divider: `#C4D6CB` for the internal separator.
- Focus: `#005FCC` for visible keyboard focus.

Use `"Trebuchet MS", Arial, sans-serif`, without downloads.
Use a 2.5rem heading, 1.25rem section headings, and 1rem body text with 1.6 line height.
Align content left. Limit the main width to 60rem and the description to 65 characters per line.
Use 1.25rem minimum horizontal gutters and generous vertical spacing.
The full-page HTML mockup establishes the visual intent.

Exact visible copy:

- H1 and document title: **Team Lunch Poll**.
- Description: **Decide where or what to eat together. Create a poll, vote for your favorite option, and see the results.**
- First H2: **Create a poll**.
- First placeholder: **Poll creation will appear here.**
- Second H2: **Poll results**.
- Second placeholder: **Results will appear here after teammates vote.**
- Scope note: **This is the app scaffold. Poll creation and voting are not available yet.**

The description states the product goal. The scope note states the current capability.
Place the two labeled sections inside one placeholder workspace.
At widths below 44rem, stack creation before results. At wider widths, show them side by side with a divider.
The page must remain readable at 320px, 1440px, and 200% zoom without horizontal scrolling or clipped text.
Use `lang="en"`, a viewport meta tag, one `main`, one H1, and ordered H2 sections.
Text must meet WCAG AA contrast. Do not use color alone to indicate meaning.
There are no app controls or motion in this issue. Do not add placeholder content to the tab order.
Provide a `:focus-visible` style for later native interactive elements without adding artificial focus targets.

## Architecture and domain assessment

This is a small architecture choice: it establishes the build tool and browser entry seam.
Domain-modeling guidance applies to that assessment, but no domain model changes occur.
`PROJECT_BRIEF.md` already supplies the terms poll, option, vote, and results.
There is one Team Lunch Poll context. No context relationships need a map.
No new term resolution, glossary, or ADR is justified by this reversible scaffold choice.
Later domain behavior remains outside this issue.

The browser shell is the only application module. Keep the static semantic markup in `index.html`.
`src/main.ts` imports `src/style.css` and is the module entry, not a second source of page markup.
This small module has limited depth because it has no domain behavior yet.
Do not invent pass-through modules to claim depth or leverage.
Markup and styling have clear locality in those two files.

The caller interface is the document at `/`, with a module script at `/src/main.ts`.
The browser must support modern ES modules and JavaScript for Vite's stylesheet import.
The page needs no environment variables, initial state, network data, or call ordering beyond normal document loading.
Vite owns development serving and asset bundling. There are no application error states or performance-sensitive operations.
CSS mechanics and tool configuration remain implementation details.
There is no dependency-injection interface, adapter, or internal test seam because no replaceable dependency exists.
Use the real browser and compiler interfaces for verification rather than private test hooks.

## Contributor interface

Keep the README's demo purpose, Patchmill workflow, and source-of-truth information.
Add the runtime prerequisites and these commands from the repository root:

| Command | Contract |
| --- | --- |
| `npm install` | Install dependencies for initial setup or intentional updates. |
| `npm ci` | Install the committed dependency versions from a clean checkout. |
| `npm run dev` | Start Vite and show its local URL. Stop with Ctrl+C. |
| `npm run check` | Run `tsc --noEmit` with strict checking and exit nonzero on errors. |
| `npm run build` | Run the type check, then build production assets into `dist/`. |
| `npm run preview` | Serve `dist/` locally after a successful build. |

Document that checks currently mean type checking and production bundling, not an automated behavior suite.
Ignore `node_modules/`, `dist/`, and local build caches. Do not ignore the lockfile.
No environment file, global Vite installation, or external service is required.

## Acceptance and verification

1. A clean dependency install succeeds on Node.js 24 LTS and npm 11: run `npm ci`.
2. The development URL shows the exact heading, description, placeholders, and scope note: inspect in a browser.
3. Mobile and desktop layout, 200% zoom, contrast, and semantic order meet the page requirements: inspect in a real browser.
4. `npm run check` succeeds. A temporary TypeScript assignment error makes it exit nonzero, then remove that probe.
5. `npm run build` produces `dist/`. `npm run preview` serves the same shell without missing assets or browser errors.
6. A contributor can use every documented command without hidden setup: run the README sequence and inspect its text.
7. No framework demo assets, fake interactions, network assets, or out-of-scope poll behavior appear: inspect files and browser requests.

The Testing Value Gate excludes automated tests that only assert this static copy or configuration.
Use compiler checks, production bundling, direct inspection, and recorded browser evidence instead.
Add behavior tests when later issues introduce behavior worth regression protection.

## Visual explanation

The browser owns the shell. Vite loads one stylesheet entry, without a state or data layer.

```text
Browser opens /
└── index.html
    ├── main
    │   ├── Team Lunch Poll + product description
    │   ├── workspace
    │   │   ├── Create a poll placeholder
    │   │   └── Poll results placeholder
    │   └── scaffold scope note
    └── script entry: src/main.ts → src/style.css
        (Vite bundles these assets for production)
```

This inline explanation applies the installed show-me guidance. The mockup shows appearance, not runtime logic.

## Companion artifacts

- `docs/mockups/2026-11-20-team-lunch-poll-scaffold.html`: [Full-page mockup](../mockups/2026-11-20-team-lunch-poll-scaffold.html).

## Open assumptions

None. Tooling and visual defaults are planner choices under the issue's delegated scope.
## Planning review

### Initial combined pass

- Scope: this specification and `docs/plans/2026-11-20-issue-1-create-the-team-lunch-poll-app-scaffold-plan.md`.
- Reviewer: fresh-context canonical `reviewer`, model `openai-codex/gpt-6.2-sol`, thinking `high`.
- Inspected base: `097cb2aa1d994dc182f1a9083eef41d63a59c436`.
- Reviewed specification body SHA-256: `2b11abaf7a5b2a62edc82e488756be4032dcabf75b05b4c9d034014ebe2d0166`.
- Reviewed plan body SHA-256: `a25213ce7e86a2269334a3f5562f3c32db3dc07ebf46fb0cf95bd588c1e4743a`.
- Survey: seed documentation establishes one product context with no existing app, tests, domain artifacts, or instructions.
  The reviewer found the static Vite shell proportionate, with no justified adapter or new domain document.
- B1, plan blocker, Accepted: move the implementation commit before independent reviews in Task 1 and the plan diagram.
- S1, plan suggestion, Accepted: remove the duplicate stylesheet count.
- S2, specification suggestion, Accepted: show the script entry and `main` as siblings in the inline diagram.
- Limits: file and history inspection only. The reviewer inspected mockup source and earlier mobile/desktop images, not a new browser render.
  No dependency installation or proposed app checks occurred.
- Initial outcome: corrections required, pending scoped confirmation.

### Fresh scoped confirmation

- Scope: B1, S1, and S2 corrections and their effects across both documents.
- Reviewer: fresh-context canonical `reviewer`, model `openai-codex/gpt-6.2-sol`, thinking `high`.
- Inspected base: `097cb2aa1d994dc182f1a9083eef41d63a59c436`.
- Reviewed and final specification body SHA-256: `d30c5e4f5f71258f522cd7c63bb97446a699b05d3d6de01a336c52a76e4ef2f4`.
- Reviewed and final plan body SHA-256: `e9f2a610cc8c06fe4eebd263b96e77d7249f3805a1a01abddbfb5c98ff6e0650`.
- Result: all three findings resolved. Commit ordering now supports committed-head reviews, and both diagrams agree with their documents.
- Limits: read-only source, history, guidance, and link inspection. No browser, server, or application checks ran in confirmation.
- Outcome: `ready`. This record does not grant human approval.
