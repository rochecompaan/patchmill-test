# Scaffold validation

## Environment and commands

Validation used Node.js v24.21.0 and npm 11.19.0 on Linux.
The original repository had no package or test suite, so no baseline tests existed.

- `npm install --save-dev vite@latest typescript@latest`: passed. The lockfile fixes Vite 8.3.8 and TypeScript 7.0.2.
- `npm ci`: passed from the repository root with the committed dependency versions.
- `npm run check`: passed with strict TypeScript and no output files.
- `npm run build`: passed. Vite produced `dist/index.html` and bundled CSS and JavaScript.
- Install-time audit: `npm install` and `npm ci` reported zero vulnerabilities.
- `git diff --check`: passed before the implementation commit.

A temporary assignment, `const typeProbe: number = 'not a number'`, made `npm run check` exit 1 with TS2322.
After removal of that assignment, both the check and build passed again.
There is no permanent static-copy test or automated behavior suite for this scaffold.

## Browser verification

Playwright used the installed Chromium browser, without adding a project dependency.
Both `npm run dev -- --host 127.0.0.1` and `npm run preview -- --host 127.0.0.1` served the shell.
The development and production pages passed inspection at widths of 320, 720, and 1440 CSS pixels.
The browser found one main landmark, the required heading order, and no artificial controls or focus targets.
The workspace used the specified pale-green background and changed from stacked to side-by-side sections at the specified breakpoint.
There was no horizontal overflow, missing asset, remote request, page exception, or console error.

An initial browser check exposed Chromium's implicit request for a missing favicon.
The document now specifies an empty data favicon to avoid that unnecessary request without adding a demo icon.
The same browser check then passed.

Native browser zoom used `chrome.tabs.setZoom` in an isolated temporary verification profile on both development and preview URLs.
At 200% zoom, a 1440px outer window had a 720px inner viewport and a device-pixel ratio of 2.
The document width remained 720px. All content remained readable without clipping or horizontal overflow.
The temporary browser extension and profile are not application files or project dependencies.
The first zoom screenshot used an incorrect capture size and showed only part of the browser surface.
Review caught that evidence error. A new CDP capture uses physical surface dimensions and shows the full description, both placeholders, and scope note.
The corrected 1440×996 screenshot confirms that all content remains visible at native 200% zoom.

The primary and secondary text colors exceed WCAG AA contrast on their backgrounds.
The lower text contrast is approximately 6.69:1 (secondary ink on the workspace).
There is no motion or interactive control in the scaffold.

## Reference screenshots

These screenshots show the production preview after its required text appeared:

- [Desktop shell](screenshots/lunch-poll-scaffold-desktop.png): 1440px viewport.
- [Mobile shell](screenshots/lunch-poll-scaffold-mobile.png): 320px viewport.
- [Browser zoom](screenshots/lunch-poll-scaffold-zoom.png): native 200% zoom.

## Frontend review corrections

Frontend review required a shorter description measure and balanced heading wraps.
The original `65ch` measure allowed 83 actual characters on the first desktop line.
A temporary browser range check reproduced that limit error and the single-word mobile title line before the repair.
The description now uses `48ch`, and headings use `text-wrap: balance`.
The same range check then passed at 320, 720, and 1440 CSS pixels.
The longest description line is now 61 characters at the tested desktop widths.
At 320px, the title wraps as “Team” and “Lunch Poll”, without a single-word final line.
The full development, preview, and native-zoom inspections passed again, and all reference screenshots are current.
The written specification's character limit takes precedence over the mockup's original `65ch` implementation.

## Decisions and limits

- Use direct checks instead of static-text tests, as required by the approved Testing Value Gate.
  The cost is that later behavior needs its own regression tests.
- Use the operating system's installed browser tools for evidence, not a new dependency in this minimal app.
  Contributors do not need Playwright to run the documented app commands.
- Keep the scope static. Poll creation, voting, calculation, and storage remain unavailable.
- Browser verification used Chromium on Linux. Other browsers were not run.
