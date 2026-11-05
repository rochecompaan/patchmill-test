# Team Lunch Poll scaffold design

## Intent and scope

Give contributors a working TypeScript web app for the next lunch poll features. This design implements issue #1.

The repository currently contains a README, a project brief, and issue prompts. No application, dependency manifest, or existing design system exists. No AGENTS.md file exists in the repository.

## Approach

The planning agent selects Vite with plain TypeScript and npm. The issue explicitly delegates the setup choice. This selection is not a prior maintainer decision.

Alternatives:

- Vite with plain TypeScript provides a development server and production build with few dependencies. It fits this static shell.
- Vite with React supports component composition but adds dependencies without a current interactive feature.
- TypeScript without Vite reduces dependencies but requires separate development and asset tooling.

Use Node.js 24 LTS and npm 11. Use compatible stable Vite and TypeScript releases at implementation time. Commit the npm lockfile. No runtime dependencies are necessary.

## App contract

The root page has the document title and single h1 `Team Lunch Poll`.

Use this product description: `Decide where or what to eat together. Create a lunch poll, vote as a team, and see the results.`

A visible `App scaffold` note explains: `Poll creation, voting, and results are not available yet.`

Provide two semantic sections with h2 headings:

- `Create a poll`: `The poll creation form will appear here.`
- `Poll results`: `Votes and the winning lunch option will appear here.`

The placeholders contain no buttons, forms, fake votes, or charts. They must not imply that poll features work. A keyboard-accessible skip link targets the main content.

## Visual design

Frontend design applies because this issue creates a browser-visible layout. The linked mockup defines the full-page visual intent.

Use a quiet lunch-table theme. A pale green page surrounds one white content surface. A green leading rule connects the heading to the two future poll areas. Avoid dashboard chrome, decorative cards, and promotional imagery.

Tokens:

- Page: `#eef5f0`.
- Surface: `#ffffff`.
- Main text: `#173b2c`.
- Secondary text: `#425b50`.
- Accent and focus: `#23613f`.
- Dividers: `#c7d8ce`.

Use `Trebuchet MS`, then Arial and sans-serif, with no font downloads. Use a bold 32–52px heading, 22–26px section headings, and 16–18px body text. Keep paragraphs under 65 characters per line.

Desktop layout: a left-aligned introduction followed by two columns for creation and results inside a centered surface, at most 960px wide. Below 640px, stack sections in reading order. Use 20px minimum mobile page gutters. Avoid fixed heights and horizontal overflow at 320px.

```text
Desktop                      Mobile
+-----------------------+    +----------------+
| Team Lunch Poll       |    | Team Lunch Poll|
| Product description   |    | Description    |
| App scaffold note     |    | Scaffold note  |
|-----------------------|    |----------------|
| Create    | Results   |    | Create         |
+-----------------------+    |----------------|
                             | Results        |
                             +----------------+
```

The subject-specific copy and shared surface replace a generic card dashboard. This keeps the issue minimal while giving future features a clear home. The explicit minimal-shell requirement takes priority over generic guidance for elaborate visual treatments.

## Accessibility and responsive behavior

Use `lang="en"`, UTF-8, and a viewport meta tag. Preserve the h1/h2 hierarchy and native landmarks. The skip link becomes visible on keyboard focus. Main content accepts the skip target without an extra tab stop.

Body text must meet WCAG AA contrast. Text remains readable at 200% zoom. Mobile and desktop show the same content in the same order. No animation or transition is necessary, so reduced-motion users receive a static page.

## Contributor interface

The README retains the repository context and existing demo workflow. Add the product scope, prerequisites, and these root-directory commands:

| Command | Result |
| --- | --- |
| `npm install` | Install dependencies and create or update the lockfile. |
| `npm ci` | Install the committed dependency versions on a fresh checkout. |
| `npm run dev` | Start the Vite development server. Open the URL that Vite prints. |
| `npm run check` | Run `tsc --noEmit` with strict TypeScript checks. |
| `npm run build` | Run the TypeScript checks, then create the production build in `dist/`. |
| `npm run preview` | Serve the existing production build for local inspection. |

Explain that checks currently mean type checking and production compilation, not an automated behavior suite. The app needs no secrets, backend, or environment file. Ignore `node_modules/` and `dist/` in Git.

## Non-goals

No poll model, form, voting, results calculations, browser storage, routing, authentication, API, deployment, UI library, or test framework belongs in this issue. Later seeded issues own those features.

## Verification and acceptance

- A fresh dependency installation succeeds with the committed lockfile.
- The documented development command serves the complete app shell.
- TypeScript checks and the production build succeed.
- The production preview shows the same shell without console errors or missing assets.
- Browser inspection covers 320px and 1280px widths, 200% zoom, keyboard focus, heading hierarchy, and placeholder honesty.
- The mockup opens directly from disk without network requests at mobile and desktop widths.

Testing Value Gate: do not introduce automated tests that only assert fixed text or configuration. Use direct browser inspection and compiler/build checks for this static scaffold. Add behavior tests when subsequent issues introduce behavior.

## Planning validation

Opened the mockup directly from disk in headless Chromium at 320×900 and 1280×900. External hostname resolution was disabled. Both screenshots showed complete content with the expected stacked and two-column layouts. The mockup contains no external assets or scripts. Product build and interactive accessibility checks remain implementation work.

## Companion artifacts

- `docs/mockups/2026-11-04-issue-1-create-the-team-lunch-poll-app-scaffold.html`: [Full-page mockup](../mockups/2026-11-04-issue-1-create-the-team-lunch-poll-app-scaffold.html)
