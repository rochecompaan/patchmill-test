# Create a lunch poll

## Intent and evidence

Issue #3 lets a teammate enter a lunch question and options, then see the created poll.
The maintainer delegated remaining choices to the planner's recommendations ("recommend all").

Inspected base: `7307d6f08264befe63aa55850ab2f98f83afe2ee`.
`index.html` contains two empty panels. `src/main.ts` only imports `src/style.css`.
`src/domain/poll.ts` defines `Poll`, `PollOption`, `Vote`, and `countVotes`.
`tests/poll.test.mjs` covers counting, opaque IDs, immutability, and JSON compatibility.
`GLOSSARY.md` defines one lunch-poll context. No repository `AGENTS.md`, context maps, or ADRs exist.
The live issue has no comments at planning time.

## Scope and approaches

This is a small UI change with one new application module interface.
Codebase design applies to its ownership and DOM seam.
Domain modeling confirms the existing poll, option, and vote relationships. No terminology or context changes are necessary.
No glossary companion or ADR is justified: this reversible local UI introduces no new domain concept or costly architectural trade-off.
Frontend design applies because the change adds a form, focus transitions, and a saved-poll view.

1. **Recommended: an inline form replaced by the created poll.** This preserves the existing page and prevents accidental replacement.
2. **Keep the form after saving.** This permits replacement but requires overwrite rules and extra state beyond this issue.
3. **A dialog or separate page.** This separates creation from viewing but introduces unnecessary navigation and focus management.

Use approach 1 under the maintainer's delegation.
Keep TypeScript, native HTML controls, Vite, and the current visual language. No UI framework or runtime dependency is necessary.

Non-goals: voting, counts, winner selection, storage, multiple polls, editing, deletion, option removal, option reordering, and duplicate-label rejection.
Issue #6 owns persistence. Issue #7 owns richer validation and empty/error states.
This issue still enforces the minimum valid input contract.

## User behavior

### Before saving

- Keep the page header and two-panel workspace.
- Replace the creation placeholder with a form titled "Create a poll".
- Show one text input labeled "Poll question" and a fieldset with the legend "Options".
- Start with exactly two empty text inputs labeled "Option 1" and "Option 2".
- Show the instruction "Enter a question and at least two lunch options."
- Provide "Add option" (`type="button"`) and "Save poll" (`type="submit"`).
- Each Add option action appends one required input with the next sequential label.
- Preserve all existing values. Move focus to the new input.
- Do not impose a product-specific option limit or text-length limit.
- Keep the results panel, with "Voting and results are not available yet." as its placeholder.
- Replace the obsolete scaffold note with "Polls stay in this tab until you reload."

### Saving and invalid input

- Handle form submission, including Enter, without navigation or reload.
- Trim surrounding whitespace from the question and every option label.
- Require a nonblank question and at least two nonblank options.
- Require every displayed option. An extra blank option blocks saving rather than disappearing silently.
- Accept duplicate labels as separate options. Preserve their order and internal whitespace.
- Retain the draft on invalid input. Focus the first invalid field and use browser constraint validation to show its message.
- Use "Enter a poll question." for a blank question and "Enter option N." for a blank option.
- Clear custom validity on input so corrected values can pass the next submission.
- No custom error summary, asynchronous save, or elaborate validation system belongs in this issue.

Use `novalidate` on the form so the submit handler validates trimmed values consistently.
Set `required` on each input for semantic meaning. Validate all inputs, then call `reportValidity()` on the first invalid input.
The two initial rows and append-only behavior enforce the row minimum. Do not expose a form operation that creates fewer rows.

### After saving

- Create one `Poll` with a nonblank opaque ID, the trimmed question, ordered options with distinct opaque IDs, and `votes: []`.
- Generate IDs independently of labels and positions with `crypto.randomUUID()` in the browser.
- Keep that poll in application memory. Do not call localStorage, sessionStorage, or a network service.
- Replace the creation form with the saved question as a level-two heading and an ordered list of option labels.
- Show "Poll created." before the list. Focus the question heading with `tabindex="-1"` after the transition.
- Remove the Add option and Save poll controls. Ignore stale repeat submissions once a current poll exists.
- Keep the results panel unchanged. Do not show fake voting controls, counts, or results.
- After reload, return to an empty creation form. This limitation is explicit in the page note.
- Insert user text with `textContent` or text nodes, never interpolated HTML.

## Module interface and ownership

Create `src/poll-app.ts` with `mountPollApp(root: HTMLElement): void`.
`src/main.ts` imports CSS and calls this function once with the workspace element.
`index.html` retains the page shell and supplies a stable workspace target.

The module owns the draft controls, validation, current `Poll | null`, option append behavior, and both workspace panels.
Its interface requires an empty or replaceable workspace in an HTML document, mounted once per root.
It synchronously replaces the workspace contents. Invalid user input is a normal UI state, not an exception.
There is no configuration, asynchronous error contract, persistence, or global singleton.
The browser must provide standard DOM APIs and `crypto.randomUUID()` (supported on localhost and secure origins).
Rendering and validation take linear time in the number of options plus text length. No cross-poll work occurs.

Keep listeners on the stable root so the current poll remains reachable after the form disappears.
The current poll guards repeated submissions. Private DOM helpers, draft extraction, and rendering details stay inside the module.
The exported interface is the DOM seam used by the entry point and behavioral tests.
No private state accessors or test-only exports are necessary.

`src/domain/poll.ts` continues to own the shared data shapes and counting. It does not acquire DOM or form dependencies.
The UI imports `Poll` as a type and satisfies the model's ID and reference invariants.
In-process data needs no adapter. The caller supplies the root rather than the module selecting a global document.
Use `root.ownerDocument` for node creation. Browser DOM and a jsdom test document exercise the same interface.
The global standard crypto capability needs no custom adapter. Implementation inspection verifies ID invariants without exposing private state to tests.

Depth comes from one mount operation that hides the complete creation lifecycle.
Deleting the module moves that lifecycle into the entry point, so it is not a pass-through.
This gives the entry point leverage and keeps UI changes local. Do not split each control or DOM helper into a separate module.

## Visual direction and accessibility

Preserve existing design choices over generic frontend-design suggestions. A new aesthetic would exceed the requested form work.
Use the existing Trebuchet MS/Arial stack, left alignment, green top rule, and quiet two-panel layout.
Tokens: ink `#18352c`, secondary text `#425c52`, white `#ffffff`, panel `#f0f7f2`, divider `#c4d6cb`, focus `#005fcc`.
Use the ink color for the Save poll button, with white text. Keep Add option visually secondary.
Use a 1rem control font, full-width inputs, and at least 44px control heights.
Retain the 44rem breakpoint: stacked panels below it and two equal columns above it.
Use min-width zero, wrapping saved text, and flexible action rows to prevent horizontal scrolling at 320px and 200% zoom.

All inputs have explicit labels. Group options with a fieldset and legend.
Maintain logical keyboard order, visible focus, and native button semantics.
Do not add animation. The result remains usable with reduced motion.
The mockup demonstrates draft and saved states in full-page context. Its preview switch is not a production control.

```text
Desktop: Team Lunch Poll
         [Create a poll          | Poll results]
         [Poll question          | Voting and results are]
         [Option 1 / Option 2    | not available yet.]
         [Add option] [Save poll |                      ]

Saved:   [Question heading       | Poll results]
         [Poll created.          | unchanged placeholder]
         [1. Soup / 2. Wrap      |                      ]
Mobile:  same panels, stacked in document order
```

## Acceptance and verification

| Requirement | Verification |
| --- | --- |
| Two labeled options and a question appear on first load | DOM interface test and browser inspection |
| Add option preserves values, adds one row, and focuses it | DOM interface test, including repeated additions |
| Save shows the trimmed question and all options in order | DOM interface test for two and four options |
| Blank or whitespace-only input cannot save | DOM interface tests for each field and correction |
| Equal labels remain separate, and text stays literal | DOM interface tests for duplicates, Unicode, and HTML-like strings |
| Saved state replaces controls and ignores stale submissions | DOM interface test |
| Poll conforms to the existing model without model changes | Strict TypeScript check and implementation review |
| Reload loses the poll and shows the documented limitation | Real-browser manual check |
| Keyboard flow and layout remain usable | Real browser at 320px, desktop, and 200% zoom |

Add jsdom as a development dependency for Node DOM interface tests.
The Testing Value Gate admits these tests because they exercise the production lifecycle and catch regressions in input handling and rendering.
Do not add tests that search documentation, CSS declarations, dependency versions, or HTML source text.
Native validation message presentation, true browser focus, responsive layout, and reload behavior need browser inspection in addition to DOM tests.

## Visual explanation

The application owns the transition. The shared model stays browser-independent.

```text
mountPollApp(workspace)
  draft: question + [option 1, option 2]
    Add option -> append required row -> focus new row
    Save poll  -> trim and validate
      invalid  -> retain draft -> focus first error
      valid    -> Poll { id, question, options, votes: [] }
               -> current poll in memory
               -> replace form with question + ordered labels
               -> focus question heading
reload -> new empty draft (no persistence)
```

## Companion artifacts

- `docs/mockups/2026-11-20-create-poll-form.html`: [Full-page interactive mockup](../mockups/2026-11-20-create-poll-form.html).

## Open assumptions

No maintainer question remains open. Replacement behavior, minimal validation, and memory-only state are planner recommendations under the maintainer's delegation.

## Planning review

### Initial combined review

- Scope: this document and `docs/plans/2026-11-20-issue-3-build-the-create-poll-form-plan.md`.
- Reviewer: fresh-context canonical `reviewer`, model `openai-codex/gpt-6.2-sol`, thinking `high`.
- Inspected base: `7307d6f08264befe63aa55850ab2f98f83afe2ee`.
- Reviewed specification body SHA-256: `6c9e11189467333cc7299e72867229b8c8f03e11fc99b7a61d435848fdd2fb38`.
- Reviewed plan body SHA-256: `b841fc4a37da2bdcd0719708f897901e7a6793567de4e139994a87044ab7b926`.
- Survey: the existing entry point only imports CSS. The shared model owns ordered options, anonymous votes, and pure counting.
- The reviewer independently inspected the shell, model, tests, glossary, neighboring issues, inline diagrams, and linked mockup.
- B1 accepted: the stale-submit test now dispatches from the retired form with a restored bubbling path.
- B2 accepted: corrected code now requires a rebuild before browser rechecks and refreshed evidence.
- S1 accepted: the specification assigns ID invariant verification to implementation inspection, not private-state tests.
- S2 accepted: the plan adds a multiple-error case to prove first-invalid focus ordering.
- Limits: no browser, server, installation, build, or tests ran in review. Mockup portability received source inspection only.
- Initial conclusion: corrections required. Revised documents await fresh scoped confirmation.
- Outcome at this pass: `blocked` pending confirmation, not a maintainer decision.

### Fresh scoped confirmation

- Scope: both issue #3 documents, limited to B1, B2, S1, S2 and their effects.
- Reviewer: fresh-context canonical `reviewer`, model `openai-codex/gpt-6.2-sol`, thinking `high`.
- Inspected base: `7307d6f08264befe63aa55850ab2f98f83afe2ee`.
- Reviewed and final specification body SHA-256: `c2a449129927d176f12cf3080964299fb6c56270a8a3c61fe052be9e7574381f`.
- Reviewed and final plan body SHA-256: `ce13ce5e5c65915825a07b06f5de10eb41b5b29a12f23361fe2fa8f74ed1704b`.
- Confirmation: all four accepted findings resolved. No blocker, suggestion, or maintainer question remains open.
- The reviewer verified form-event targeting, rebuild-before-evidence ordering, inspection ownership, and first-invalid focus coverage.
- The source survey again covered the shell, model, counting tests, package scripts, and the DOM module seam.
- Limits: no browser, server, install, build, tests, or live host comment query in review. Mockup inspection was source-only.
- Planner self-review opened the mockup offline in Chromium at 1280×1200 and 375×1300 and inspected both screenshots.
- Outcome: `ready`. This is planning readiness, not human approval or implemented behavior.
