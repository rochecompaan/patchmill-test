# Team Lunch Poll Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the installed `executing-plans` skill for inline execution. Steps use checkbox syntax for tracking.

**Goal:** Give contributors a runnable TypeScript app with an honest, static Team Lunch Poll shell.

**Architecture:** Semantic `index.html` owns the page. A single TypeScript entry imports the stylesheet. Vite serves and bundles the assets without a framework or data layer.

**Tech Stack:** Node.js 24 LTS, npm 11, stable compatible Vite and TypeScript, native HTML and CSS.

**Spec:** [Scaffold design](../specs/2026-11-20-issue-1-create-the-team-lunch-poll-app-scaffold-design.md).

## Inputs and execution

- Read the specification and its acceptance criteria before implementation.
- Read [the full-page mockup](../mockups/2026-11-20-team-lunch-poll-scaffold.html).
- Read the specification's inline Visual explanation. There is no separate conceptual HTML companion.
- Read `PROJECT_BRIEF.md`, `README.md`, and `issues/01-project-scaffold.md`.
- Use the supplied issue worktree and branch. No other worktree or planning merge is required.
- Execute inline through `.patchmill/skills/executing-plans/SKILL.md` from the configured project skill installation.
- Follow the implementation-stage frontend review and visual-evidence skills for committed reference screenshots and final review.

## Global constraints

- Use Node.js 24 LTS and npm 11.
- Use strict TypeScript with DOM types, ES modules, and no emitted TypeScript output during checks.
- No CSS framework, remote fonts, icons, or runtime dependencies are necessary.
- Do not implement poll creation, voting, results calculation, storage, routing, authentication, a backend, or deployment.
- Do not add sample votes, fake results, inactive buttons, or framework demo assets.
- Keep the README's demo purpose, Patchmill workflow, and source-of-truth information.
- Use the specification's exact visible copy and visual tokens.

## Review focus

These five conditions need direct verification in Task 1. They do not justify static-text or configuration tests.

1. A clean checkout needs only the documented runtime and commands, not a global Vite installation.
2. A narrow viewport and 200% zoom preserve readable content without horizontal scrolling.
3. The product description must not imply that placeholder controls already work.
4. The production preview must load the stylesheet, not only the development server.
5. A type error must fail the check command rather than pass through Vite transpilation.

## File responsibilities

| Path | Responsibility |
| --- | --- |
| `package.json` | Private package, runtime requirements, scripts, and development dependencies. |
| `package-lock.json` | Reproducible npm installation. |
| `tsconfig.json` | Strict browser TypeScript configuration with no emit. |
| `.gitignore` | Exclude dependencies, build output, and local caches. |
| `index.html` | Document metadata and the full semantic static shell. |
| `src/main.ts` | Import the stylesheet. |
| `src/style.css` | Typography, visual tokens, responsive layout, and focus treatment. |
| `README.md` | Runtime prerequisites, contributor commands, and current scope. |
| `docs/screenshots/` | Implementation evidence under the installed visual-evidence skill's naming convention. |

No Vite configuration file, public assets directory, router, test framework, or extra application module is required.

## Task 1: Deliver and verify the runnable shell

Tool configuration, the page, and contributor documentation form one independently verifiable scaffold.
The deliverable is incomplete if any of these parts is absent.

**Files:** Create the seven new files in the responsibility table. Modify `README.md`.
Create screenshot evidence under `docs/screenshots/` using the installed visual-evidence skill.

**Interfaces:**

- Consumes: the browser document interface and Vite's native HTML entry behavior.
- Produces: `/` with the specification's static shell, `dist/` from the production build, and the six documented npm commands.
- `index.html` loads `<script type="module" src="/src/main.ts"></script>` after the page markup.
- `src/main.ts` imports `./style.css`. No exported function, state interface, or adapter is needed.

### Steps

- [ ] **1. Confirm the baseline.** Run `git status --short` and inspect tracked files in the supplied issue worktree.
  Preserve committed planning documents and existing README content. Verify that no app package already exists.
- [ ] **2. Create the package configuration.** Set `private: true`, `type: "module"`, and `engines` for Node `24.x` and npm `11.x`.
  Add stable compatible Vite and TypeScript as development dependencies.
  Set scripts exactly: `dev: vite`, `check: tsc --noEmit`, `build: npm run check && vite build`, and `preview: vite preview`.
  Configure TypeScript with `strict: true`, `noEmit: true`, `target: ES2022`, `module: ESNext`, and `moduleResolution: Bundler`.
  Use `lib: ["ES2022", "DOM", "DOM.Iterable"]`, `types: ["vite/client"]`, and `include: ["src"]`.
  Ignore `node_modules/`, `dist/`, and `*.tsbuildinfo`. Keep the lockfile tracked.
- [ ] **3. Add the static shell and stylesheet entry.** Create `index.html` with `lang="en"`, UTF-8, viewport metadata, and title `Team Lunch Poll`.
  Copy the specification's exact visible text and semantic structure into this file.
  Create `src/main.ts` with the stylesheet import. Do not duplicate markup in TypeScript.
- [ ] **4. Add the visual treatment.** Implement `src/style.css` from the linked mockup and specification tokens.
  Match the 44rem responsive breakpoint, 60rem content width, typography, minimum gutters, single workspace, and internal divider.
  Preserve semantic source order, contrast, and visible focus treatment. Add no animation or false controls.
- [ ] **5. Install and lock dependencies.** Run `npm install` with the documented runtime.
  Inspect the generated lockfile and dependency engine requirements. Resolve incompatible versions before proceeding.
- [ ] **6. Verify compiler and production output.** Run `npm run check` and `npm run build`.
  Expect both commands to exit zero and Vite to produce `dist/index.html` and bundled assets.
  Temporarily append `const typeProbe: number = 'not a number'` to `src/main.ts`.
  Run `npm run check`. Expect a nonzero exit and a TypeScript assignment error.
  Remove the probe. Run both commands again and expect zero exits. Do not commit the probe.
- [ ] **7. Write contributor instructions.** Add Node.js 24 LTS and npm 11 prerequisites to `README.md`.
  Document `npm install`, `npm ci`, `npm run dev`, `npm run check`, `npm run build`, and `npm run preview`.
  Explain Vite's printed local URL, Ctrl+C, the preview build prerequisite, and the current static scope.
  State that there is no automated behavior suite yet. Preserve the original demo workflow and source-of-truth text.
- [ ] **8. Verify the clean contributor path.** Run `npm ci`, `npm run check`, and `npm run build` from the repository root.
  Expect zero exits without environment files, global Vite, or external services.
  Compare each README command with its package script. This covers review focus 1 and 5.
- [ ] **9. Inspect development and production in a real browser.** Run `npm run dev -- --host 127.0.0.1`.
  Open the printed URL at 320px and 1440px widths and at 200% browser zoom.
  Verify exact copy, section order, no clipping or horizontal scrolling, and no fake controls or console errors.
  Inspect heading semantics, contrast, and browser requests for absent remote assets.
  Stop the development server. Run `npm run preview -- --host 127.0.0.1` and inspect the printed URL.
  Expect the same styled shell and no missing assets or console errors. Stop the preview server.
  Record results and capture committed desktop/mobile evidence as required by the installed visual-evidence skill.
  This covers review focus 2, 3, and 4 and the remaining acceptance criteria.
- [ ] **10. Inspect and commit the scaffold.** Inspect `git diff --check`, `git diff`, and untracked files.
  Verify that dependency directories, build output, temporary probes, and temporary browser data are absent from the staged changes.
  Commit the validated scaffold and screenshots with `feat: add Team Lunch Poll app scaffold`.
- [ ] **11. Review the committed implementation.** Run the whole-branch review under the implementation and executing-plans skills against the committed head.
  Resolve accepted findings, rerun affected verification, and commit corrections.
  Then complete the frontend review against the resulting committed head under the installed frontend-review skill.
  If frontend review needs changes, repeat the affected verification and commit them before its required confirmation.
  Do not report completion until the required reviews cover the final committed implementation.

## Testing Value Gate

This task adds no production behavior beyond a static document and CSS.
Do not add tests that only assert document text, static configuration, dependency versions, or script strings.
The compiler error probe verifies the contributor check interface without a permanent test fixture.
The real-browser inspections verify the page interface and production assets without private seams or mocks.
Later issues own behavior tests for creation, voting, results, and persistence.

## Visual explanation

The installed show-me guidance yields a single task flow. Verification precedes the commit, and independent reviews inspect committed code.

```text
Read spec + mockup + existing README
  → package configuration + semantic shell + stylesheet
  → install dependencies and generate lockfile
  → compiler/build + temporary negative compiler probe
  → document and run the clean contributor path
  → development/production browser inspection + screenshot evidence
  → commit validated scaffold + screenshots
  → whole-branch review → verify and commit accepted corrections
  → frontend review of resulting committed head
  → verify and commit any corrections → required confirmation
```

One worker owns all files. No task adapter or parallel integration seam is needed.

## Companion artifacts

No new planning companion is required. The linked mockup belongs to the specification.

## Open assumptions

None. Compatible dependency patch versions remain an implementation choice, fixed in the committed lockfile.
## Planning review

### Initial combined pass

- Scope: this plan and `docs/specs/2026-11-20-issue-1-create-the-team-lunch-poll-app-scaffold-design.md`.
- Reviewer: fresh-context canonical `reviewer`, model `openai-codex/gpt-6.2-sol`, thinking `high`.
- Inspected base: `097cb2aa1d994dc182f1a9083eef41d63a59c436`.
- Reviewed plan body SHA-256: `a25213ce7e86a2269334a3f5562f3c32db3dc07ebf46fb0cf95bd588c1e4743a`.
- Compared specification body SHA-256: `2b11abaf7a5b2a62edc82e488756be4032dcabf75b05b4c9d034014ebe2d0166`.
- Survey: the reviewer independently inspected the documentation-only seed and neighboring issue prompts.
  The task covers the requested shell and contributor workflow without speculative modules or static-text tests.
- B1, plan blocker, Accepted: Task 1 now commits validated code and screenshots before whole-branch review and subsequent frontend review.
  The inline diagram now shows the same ordering, including verified and committed corrections.
- S1, plan suggestion, Accepted: the file list now counts the stylesheet once.
- S2, specification suggestion, Accepted: the specification diagram now makes the script and `main` siblings.
- Limits: no app exists yet. The reviewer inspected files, history, links, mockup source, and earlier mockup images without installation or app checks.
- Initial outcome: corrections required, pending scoped confirmation.

### Fresh scoped confirmation

- Scope: B1, S1, and S2 corrections and their effects across both documents.
- Reviewer: fresh-context canonical `reviewer`, model `openai-codex/gpt-6.2-sol`, thinking `high`.
- Inspected base: `097cb2aa1d994dc182f1a9083eef41d63a59c436`.
- Reviewed and final plan body SHA-256: `e9f2a610cc8c06fe4eebd263b96e77d7249f3805a1a01abddbfb5c98ff6e0650`.
- Compared and final specification body SHA-256: `d30c5e4f5f71258f522cd7c63bb97446a699b05d3d6de01a336c52a76e4ef2f4`.
- Result: all three findings resolved. The review sequence covers committed code, and the file count and diagrams are consistent.
- Limits: read-only source, history, guidance, and link inspection. No browser, server, or application checks ran in confirmation.
- Outcome: `ready`. This record does not grant human approval.
