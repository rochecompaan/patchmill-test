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
| `npm test` after the review fix pass | Passed, 36 tests: 28 form cases and 8 unchanged model cases. |
| Node 24.0.0 `npm ci --engine-strict` | Passed against the final jsdom 29 lockfile. |
| Node 24.0.0 `node --test tests/*.test.mjs` | Passed, 36 tests at the declared Node floor. |
| `npm run check` | Passed, strict TypeScript. |
| `npm run build` | Passed, Vite production bundle. |
| `git diff --check` | Passed. |

The new suite first failed because the production module was absent.
A no-op mount then failed the interface tests. The initial complete module passed 24 tests.
The review fix pass expanded the blank-input matrix to Unicode NEXT LINE, nonbreaking space, and the byte-order mark.
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
- A rendered-spacing check distinguishes `A  B` from `A B` in saved labels and the question.
  Before the fix, both labels measured 24.91 pixels. After the fix, the double-space label measured 29.36 pixels.
  The saved question measured 39.27 pixels with two spaces and 33.70 pixels with one.
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

## Independent implementation review and fix pass

The fresh-context canonical reviewer used `openai-codex/gpt-6.2-sol` with high thinking against `7307d6f..3419c1d`.
The review found three Important issues and one Minor issue.

- Accepted: remove the mirrored option-input array and linear per-edit scan. The form controls now own draft ordering.
  Clearing custom validity uses the edited input directly. The 36-test suite remained green after this structural simplification.
- Accepted: preserve visible internal spaces with `white-space: pre-wrap` for saved questions and labels.
  A real-browser rendered-width regression failed before the change and passed after it.
- Accepted: keep the declared Node 24.x support. jsdom 31 rejected Node 24.0.0 with `EBADENGINE`.
  jsdom 29 and its locked transitive dependencies passed a clean engine-strict install and all 36 tests on Node 24.0.0.
- Regraded Unicode NEXT LINE from Minor to Important: a whitespace-only option violated the nonblank entry contract.
  Four new regression cases failed before boundary trimming included Unicode `White_Space`. All 36 cases then passed.

The app was rebuilt before browser rechecks. All four screenshots were refreshed from the corrected build.
No second normal review was required for this one fix pass. The separate frontend review follows it.

### Rulings and deferred findings

- Ruling: keep option removal, saved-poll editing/replacement, and multiple polls out of scope, as the approved design requires.
  Cost if wrong: users must reload and re-enter a poll to correct it.
- Ruling: keep voting, results calculation, and persistence for their assigned issues.
  Cost if wrong: this increment cannot complete the whole lunch decision workflow.
- Ruling: keep one workspace per document, matching the only production caller.
  Cost if wrong: a future second mount needs unique control IDs and an explicit mounting contract.
- Ruling: require localhost or a secure origin for ID generation, as documented in the approved design.
  Cost if wrong: arbitrary insecure HTTP hosts cannot save polls.
- Ruling: do not reject format-only strings such as `U+200B`. They are not Unicode whitespace, and no formatting-character policy was approved.
  Cost if wrong: a format-only label can look empty despite satisfying the current text policy.

No Minor findings remain deferred from this review.

## Human Reviewer Callouts (Non-Blocking)

- Adds `jsdom` and its transitive dependencies for development tests only. No runtime dependency, migration, permission or authentication change, breaking public contract, or irreversible operation.

## Review boundary and residual risks

Frontend review applies because the delivery adds visible controls, responsive styling, keyboard behavior, and a saved-poll transition.
The existing font, colors, breakpoint, and page structure take precedence over generic style recommendations.

Polls are intentionally memory-only and disappear on reload. Editing, replacement, voting, results, and storage remain out of scope.
`crypto.randomUUID()` requires a secure context or localhost. The local preview meets that requirement.
Native validation presentation can differ between browsers. Only Chromium received real-browser inspection.
The committed DOM suite remains reproducible with `npm ci && npm test`. Browser scripts were temporary validation tools, not a new maintained suite.
