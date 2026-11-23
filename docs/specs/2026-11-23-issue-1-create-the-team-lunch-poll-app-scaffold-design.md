# Team Lunch Poll app scaffold

[Issue #1](https://github.com/rochecompaan/patchmill-test/issues/1) gives contributors a working app to extend. The first screen explains how the product will help teammates decide where or what to eat.

## Scope and approach

The base has no app or app tests. `README.md` describes the Patchmill demo, and `PROJECT_BRIEF.md` calls for a simple, local app. Use Vite with vanilla TypeScript and npm at the repository root. Vite gives contributors one development server and a production build. Plain TypeScript without Vite needs separate compile and serve steps. A framework adds runtime dependencies without solving a current problem.

This choice defines the initial browser and build architecture, not a domain model. The shell belongs to one lunch polling context. Poll creation, voting, results calculation, persistence, accounts, and deployment are out of scope. There is no poll state, so the placeholder is not an empty poll or a result of zero votes. `PROJECT_BRIEF.md` sets the product vocabulary. This issue adds no domain rules or new terms that need a glossary. The tooling choice is reversible, so it does not need an ADR.

## Shell interface

The browser loads `GET /` and shows a single page. Semantic HTML owns the page copy and heading order. A private `src/main.ts` entry imports the stylesheet. The shell exports no functions and needs no configuration, data, or environment variables. There is no runtime request for data, no initialization order beyond normal module loading, and no app-specific error state. The content remains readable without JavaScript. The shell needs no network assets beyond the files that its own server supplies.

The browser page is the module interface that users and smoke checks exercise. The HTML keeps the shell copy in one place for locality. Contributors can extend it without learning a client framework. A separate render module or adapter adds no leverage here. No dependency varies at a seam, so there is nothing to inject or substitute in tests.

## Frontend design

Frontend design applies because this issue adds the first browser layout. Use a compact lunch-menu layout: a plum masthead, a pale lilac page, and a mint placeholder panel. Use bold Georgia for the title and system sans-serif for body text. Align text to the left. On wide screens, place the two notices side by side within one panel. On narrow screens, stack them in the same reading order.

Use one `main`, one `h1`, and a labeled workspace section with an `h2`. Use an `h3` for each notice. The page title and `h1` are both “Team Lunch Poll.” Use this copy:

- “Help your team decide where or what to eat for lunch.”
- “Poll workspace”
- “Create a poll” / “Poll creation will appear here.”
- “Results” / “Voting results will appear here.”

The placeholder shows no form fields, buttons, links, sample votes, or fake results. That keeps the page honest about what works. The shell has no motion and no interactive element to receive keyboard focus. Do not add focus stops to static content. The mockup shows the layout intent, not a new runtime dependency.

## Global constraints

- Use Node.js 24 LTS and npm 11.
- Commit `package-lock.json` and use `npm ci` for contributor installs.
- Use no runtime npm dependencies, remote assets, backend, or persistent storage.
- Preserve the existing Patchmill instructions in `README.md`.

## Acceptance and verification

| Requirement | Verification |
| --- | --- |
| A clean checkout can install, run, and check the app. | Follow the new README steps: `npm ci`, `npm run dev`, and `npm run check`. The check runs TypeScript without emit and then builds with Vite. |
| The page has the title, description, and a placeholder for poll creation and results. | Open the development page and the production build preview. Inspect the copy, headings, and lack of controls. |
| The layout works on mobile and desktop. | Inspect the page at 320 and 1280 CSS pixels. Check notice order, readable text, and lack of horizontal overflow. |

## Visual explanation

The first page shows where features will go without representing a live poll.

```text
GET /
└── Team Lunch Poll
    ├── Product description
    └── Poll workspace (static)
        ├── Create a poll notice — no form
        └── Results notice — no data
```

## Companion artifacts

- `docs/mockups/2026-11-23-team-lunch-poll-app-scaffold.html`: [Full-page mockup](../mockups/2026-11-23-team-lunch-poll-app-scaffold.html)
## Planning review

Scope: combined specification and plan, with their inline explanations and linked mockup.
- Spec: `docs/specs/2026-11-23-issue-1-create-the-team-lunch-poll-app-scaffold-design.md`
- Plan: `docs/plans/2026-11-23-issue-1-create-the-team-lunch-poll-app-scaffold-plan.md`
- Reviewer for both passes: `reviewer`, `openai-codex/gpt-6.2-sol`, thinking `high`.
- Base: `4eb64b6d8bf5a9d23d1a9fe7cfa2dbb498918a2a`.

### Initial pass
- Reviewed specification body SHA-256: `5493e456f7c91f55f7708b51bbbe96fcc84335aeaa477c493e81e02f89918e66`.
- Reviewed plan body SHA-256: `7b450268fa59549d7a0fbbbc021cabdc9f2b700ac6fab0d448e46b020c69d110`.
- Survey: The base has no app source, tests, glossary, or ADRs. The static shell needs no domain module or adapter. Both visuals match the documents.
- B1 (blocker), accepted: the preview smoke check now ignores only a 404 from the implicit favicon probe.
- S1 (suggestion), accepted: the plan checks the staged diff before commit.
- S2 (suggestion), accepted: the mockup names the design document in a comment.
- Initial result: not ready. The reviewer used static inspection and cached package evidence.

### Scoped confirmation
- Reviewed specification body SHA-256: `5493e456f7c91f55f7708b51bbbe96fcc84335aeaa477c493e81e02f89918e66`.
- Reviewed plan body SHA-256: `6e749917005cccfc6d765d54e5b24bc0e7e6c4ce1eaffafe25ccda975ab7b952`.
- Confirmation: The reviewer confirmed all three corrections. The architecture and both inline explanations remain accurate. No findings remain open.
- Limits: The reviewer did not install, build, start a server, open a browser, or inspect the host. The planner inspected the mockup from disk at 320 and 1280 CSS pixels. App checks remain for implementation.
- Final body SHA-256: `5493e456f7c91f55f7708b51bbbe96fcc84335aeaa477c493e81e02f89918e66`.
- Outcome: `ready`.
