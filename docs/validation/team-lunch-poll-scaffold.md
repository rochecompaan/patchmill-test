# Scaffold validation

## Environment and commands

Validation used Node.js 24.21.0, npm 11.19.0, Vite 8.3.5, and TypeScript 7.0.2.
The baseline had no package manifest or test suite.

The following commands passed:

- `npm install`: installed dependencies and reported zero audit vulnerabilities.
- `npm ci`: reinstalled the committed dependency versions.
- `npm run check`: strict TypeScript checks passed.
- `npm run build`: TypeScript checks and the Vite production build passed.
- `git diff --check`: no whitespace errors.
- `git check-ignore node_modules dist`: both generated directories are ignored.

No automated behavior suite was added. The approved Testing Value Gate requires direct verification for this static shell.

## Browser observations

Playwright used the installed Chromium browser. Existing external Playwright tooling ran read-only as a validation tool. No browser dependency was added to the app.

Both development and production preview passed these checks:

- At 320px, the sections stack with no horizontal overflow.
- At 1280px, the sections use two columns with no horizontal overflow.
- The page contains one h1 and two h2 headings.
- The placeholders explain that poll features are unavailable. No fake controls or data appear.
- Tab exposes the skip link with a visible outline. Enter moves focus to the main content.
- Reduced-motion mode has no active animations.
- No console errors, page errors, failed requests, or HTTP errors occurred.
- The app styles loaded successfully in both server modes.

A 640 CSS-pixel viewport at device scale factor 2 emulated 200% zoom in a 1280-pixel window. Text remained readable without horizontal overflow. This verifies equivalent reflow, not a manual browser-menu zoom action.

Text contrast against white measured 12.36:1 for main text and 7.38:1 for secondary text. The accent measured 7.36:1.

## Visual evidence

These screenshots show the production preview after the headings became visible:

- [Desktop shell](../screenshots/lunch-poll-scaffold-desktop.png)
- [Mobile shell](../screenshots/lunch-poll-scaffold-mobile.png)
- [200% zoom equivalent](../screenshots/lunch-poll-scaffold-zoom.png)

Visual inspection confirmed complete content, readable spacing, and the approved mockup layout. Balanced heading wrapping changes the mobile line break without changing the design intent.

## Limits and review

Validation covers Chromium only. It does not include a screen-reader session or a manual browser-menu zoom action.

Normal code review and frontend review run as separate self-review passes under the kernel workflow. They provide less independent assurance than a fresh reviewer.

The frontend review applies because this delivery introduces layout, styles, responsive behavior, and keyboard navigation. The approved sentence-case headings override the generic title-case guideline. Native skip-link keyboard behavior needs no custom key handler.

The separate normal and frontend self-review passes reviewed source commit `af20d18` against base `d91705a`. Both passed with no findings or deferred items. The review covered the five plan focus conditions, the approved mockup, and the pinned local interface guidelines. No production repairs were necessary.
