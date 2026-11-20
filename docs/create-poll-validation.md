# Create-poll validation

## Scope and environment

The implementation follows the [approved design](specs/2026-11-20-issue-3-build-the-create-poll-form-design.md) and [plan](plans/2026-11-20-issue-3-build-the-create-poll-form-plan.md).
The running app is the Vite production build, not the planning mockup.

- Node.js: 24.21.0. npm: 11.19.0.
- Browser: system Chromium 155.0.8059.84, headless.
- Browser automation: existing Playwright Core 1.42.1 from `/tmp/ffcheck/node_modules/playwright-core`.
- No browser tooling dependency was added to the project.
- Preview: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`.
- Readiness: HTTP success, visible Create a poll heading, and visible Option 2 input.

## Automated checks

| Command | Result |
| --- | --- |
| `npm ci` | Passed. Clean dependency installation. |
| `node --test tests/poll.test.mjs` before implementation | Passed, 8 tests. |
| `npm test` after implementation | Passed, 24 tests: 16 form cases and 8 unchanged model cases. |
| `npm run check` | Passed, strict TypeScript. |
| `npm run build` | Passed, Vite production bundle. |
| `git diff --check` | Passed. |

The new suite first failed because the production module was absent.
A no-op mount then failed the interface tests. The complete module passed all 24 tests.
The tests use fresh jsdom documents and real production handlers without global DOM replacements or private-state accessors.

## Browser observations

A temporary Playwright script exercised the built preview through actual Chromium keyboard, mouse, and input actions.
All browser assertions passed. The implementation author also inspected the four reference images.

- Tab order is question, Option 1, Option 2, Add option, then Save poll. Each stop has a visible focus outline.
- Repeated Add option actions preserve earlier values and focus the newest required field.
- Enter submits without navigation. Four options appear in their original order, with surrounding whitespace removed.
- Saving removes the form and focuses the saved question heading. Voting controls remain absent.
- Empty and whitespace-only values block saving in every initial field and in an added field.
- Invalid submission preserves the draft, focuses the first invalid field, and exposes the exact custom validation message.
- The native validation popup appeared beside the question field. Popup appearance is browser-controlled.
- Editing clears custom validity. A corrected submission succeeds.
- With two invalid fields, the question receives focus first. After question correction, Option 2 receives focus.
- Reload clears the poll and restores the empty form. The note explains this limitation.
- Duplicate Unicode labels remain separate entries. HTML-like question and option text appears literally without injected elements.
- The page produced no console errors or uncaught browser exceptions during these checks.

## Layout and accessibility observations

The browser checked 1280×900 desktop and 320×900 mobile viewports.
An additional 640×450 CSS viewport checked narrow-layout reflow independently.
Long, unbroken questions and option labels wrapped without horizontal page scrolling.
Controls remained at least 44 CSS pixels tall. The panels used two desktop columns and stacked on narrow screens.

Native 200% browser zoom received a separate check with a temporary Chromium profile.
The script used Chromium's settings-page `chrome.settingsPrivate.setDefaultZoom(2)` before it opened the app.
The 1280-pixel window then reported `innerWidth: 640` and `devicePixelRatio: 2`.
The form remained reachable, and long saved text wrapped without horizontal scrolling.
A direct preference-file attempt did not apply zoom and was not counted as successful evidence.

All inputs have associated labels, and options have a fieldset legend.
The saved section points to its question heading through `aria-labelledby`.
The page adds no animation. Reduced-motion emulation did not change its operation.
No screen-reader announcement audit or non-Chromium browser inspection occurred.

## Reference screenshots

The form images show a draft with one added option. The saved images show the same question and three ordered options.
The sample matches the planning mockup: “Where shall we eat lunch?”, Soup kitchen, Falafel wraps, and Sushi counter.
Screenshots are full-page images, so their heights can exceed the viewport.

- [Desktop form](screenshots/create-poll-form-desktop.png), viewport 1280×900.
- [Mobile form](screenshots/create-poll-form-mobile.png), viewport 320×900.
- [Desktop saved poll](screenshots/create-poll-saved-desktop.png), viewport 1280×900.
- [Mobile saved poll](screenshots/create-poll-saved-mobile.png), viewport 320×900.

Captures waited for the visible form fields or saved heading and final option before the screenshot.
No preview-only mockup controls appear in the app.

## Review boundary and residual risks

Frontend review applies because the delivery adds visible controls, responsive styling, keyboard behavior, and a saved-poll transition.
The existing font, colors, breakpoint, and page structure take precedence over generic style recommendations.

Polls are intentionally memory-only and disappear on reload. Editing, replacement, voting, results, and storage remain out of scope.
`crypto.randomUUID()` requires a secure context or localhost. The local preview meets that requirement.
Native validation presentation can differ between browsers. Only Chromium received real-browser inspection.
The committed DOM suite remains reproducible with `npm ci && npm test`. Browser scripts were temporary validation tools, not a new maintained suite.
