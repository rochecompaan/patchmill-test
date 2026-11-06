# Create-poll form

## Intent and context

Let a teammate create a lunch poll and see its question and options immediately.
This implements issue #3. The scaffold and shared `Poll` model already exist.

The maintainer selected page-only state. A refresh clears the poll.
Issue #6 owns browser storage. Issues #4 and #5 own voting and results.

## Approaches

- **Selected: plain TypeScript form and page-only state.** Reuse the scaffold and shared model without dependencies or navigation.
- **Browser storage now:** survives refresh, but duplicates issue #6 and expands this change.
- **A framework or separate route:** adds setup without improving this small, single-page flow.

The maintainer accepted the first recommendation. The detailed interaction choices below are planning defaults, not separate maintainer requests.

## Scope and behavior

1. Replace the creation placeholder with a form. Start with an empty question and two empty option fields.
2. Use visible labels: “Poll question”, “Option 1”, and “Option 2”. Use a fieldset with the legend “Lunch options”.
3. Provide “Add option” and “Save poll” buttons. Adding an option appends one empty, sequentially labeled field.
4. Preserve existing input when adding an option. Focus the new field. The add button never submits the form.
5. Trim the question and all labels on save. Require a nonempty question and at least two nonempty labels.
6. Reject every blank option, including an added option. Do not silently discard blank fields.
7. Keep the draft after an invalid save. Show “Enter a question and at least two options. Fill in every option.”
8. Associate the message with the form and announce it through an alert. Focus the first blank field.
9. On success, create a `Poll` with a generated opaque ID, ordered options with distinct generated IDs, and `votes: []`.
10. Replace the creation form with the saved poll question and a semantic list of its options. Focus the saved question heading.
11. Hide the old creation placeholder. Keep the results area with an accurate “Voting and results are not available yet.” note.
12. Update the scaffold note to explain page-only state: “This poll stays until you refresh or close this page.”

One poll per page load is sufficient. Do not add editing, option removal, reset, or replacement controls.
Duplicate option labels are valid. Preserve their order and assign different IDs.
Do not impose an arbitrary option count or text length limit.
Use text nodes or `textContent` for user input, never HTML interpolation.

## Implementation boundaries

Use Node.js 24 LTS and npm 11. Keep plain TypeScript, Vite, and the existing test runner.
Do not add dependencies, storage, vote controls, vote totals, winner logic, authentication, or network requests.
Keep `src/poll.ts` unchanged. It defines the shared model, not form validation.

Separate pure draft conversion from DOM behavior. Generate IDs only after validation succeeds.
Use `crypto.randomUUID()` in the browser and inject an ID factory into the pure conversion function for tests.
Keep the current poll in page memory. The saved view consumes the complete `Poll` value for later voting work.
Issue #7 can expand field-specific validation and empty-state copy later. This issue enforces the minimum creation contract now.

## Frontend design

Frontend design applies because this change adds form controls, validation, focus transitions, and a saved-poll view.
Preserve the approved scaffold rather than redesign it to generic frontend-design preferences.

- Palette: page `#eef5f0`, surface `#ffffff`, text `#173b2c`, secondary `#425b50`, accent `#23613f`, divider `#c7d8ce`.
- Typography: existing Trebuchet MS with Arial and sans-serif fallbacks. Preserve the scaffold heading scale.
- Layout: left-aligned creation and results columns inside the existing 960px panel. Stack columns below 640px.
- Controls: full-width text fields, readable 16px text, and targets at least 44px high. Use a solid green save button.
- Hierarchy: labels directly precede their inputs. Keep the add button secondary and near the option fields.
- Accessibility: semantic form, explicit labels, visible focus, alert message, and deliberate focus after add/save.
- Resilience: wrap long saved text, allow controls to shrink, and avoid horizontal scrolling at 320px and 200% zoom.
- Motion: no animation or transitions. Reduced-motion preferences therefore need no special behavior.

```text
Desktop: [Team Lunch Poll                                  ]
         [Create a poll + fields | Poll results / note     ]
Saved:   [Question + option list | Poll results / note     ]
Mobile:  [Title][Form or saved poll][Poll results / note]
```

The distinctive element remains the scaffold's green top rule and lunch-focused content.
Do not add decorative badges, cards, gradients, or unrelated imagery.

## Companion artifacts

- `docs/mockups/2026-11-06-issue-3-build-the-create-poll-form.html`:
  [Interactive full-page mockup](../mockups/2026-11-06-issue-3-build-the-create-poll-form.html)

The mockup opens directly from disk. Its embedded styles and script demonstrate the proposed form and saved state without network access.

Planning review opened the file in headless Chromium at 1440px and 390px widths with external DNS blocked.
The screenshots show the full-page desktop columns and mobile stack without clipped controls.
These temporary planning screenshots are not implementation evidence.

## Acceptance and verification

- Create a poll from two options and from three or more options.
- Reject blank or whitespace-only questions and options without losing the draft.
- Preserve option order, duplicate labels, and distinct IDs. Start with no votes.
- Show markup-like input literally without creating elements.
- Verify keyboard submission, add-button behavior, focus transitions, and error announcements in a browser.
- Verify mobile layout, desktop layout, 200% zoom, long text, and refresh clearing the poll.
- Run focused Node behavior tests, the existing suite, strict TypeScript checks, and the production build.
- Capture implementation screenshots and complete the frontend review during implementation, not during planning.
