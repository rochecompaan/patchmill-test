# Team Lunch Poll Scaffold Implementation Plan

> **For agentic workers:** Use the installed `.patchmill/skills/executing-plans/SKILL.md` for inline execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give contributors a runnable TypeScript app with a clear placeholder for future poll creation and results.

**Architecture:** Vite serves and builds a single root page. The HTML owns the static content, and a private TypeScript entry imports the stylesheet.

**Tech Stack:** Node.js 24 LTS, npm 11, Vite 7.3.8, TypeScript 5.9.3, and CSS.

**Spec:** [Scaffold design](../specs/2026-11-23-issue-1-create-the-team-lunch-poll-app-scaffold-design.md).

## Inputs

- [Scaffold design](../specs/2026-11-23-issue-1-create-the-team-lunch-poll-app-scaffold-design.md), including its inline visual explanation.
- [Full-page mockup](../mockups/2026-11-23-team-lunch-poll-app-scaffold.html).

## Global Constraints

- Use Node.js 24 LTS and npm 11.
- Commit `package-lock.json` and use `npm ci` for contributor installs.
- Use no runtime npm dependencies, remote assets, backend, or persistent storage.
- Preserve the existing Patchmill instructions in `README.md`.

## Review Focus

- First install: `npm ci` succeeds without global Vite or TypeScript, and the lockfile agrees with the manifest.
- Development and production: both serve `/` with the same content and styling.
- Narrow and wide viewports: the workspace notices keep their order and do not overflow.
- Static content: the page is readable without JavaScript and gives no false impression that users can create a poll or vote.
- Existing workflow: the new contributor instructions do not replace the Patchmill instructions.

## Visual explanation

One task owns the first working page and the commands a contributor uses to reach it.

```text
Task 1: runnable shell
  Install toolchain → add page and stylesheet → document commands
    → repeat install and run checks → inspect dev and build preview → commit
```

## Task 1: Deliver the runnable shell and local workflow

**Files:**

- Create `package.json` and `package-lock.json` for local commands and development dependencies.
- Create `tsconfig.json` for browser type checking.
- Create `index.html` for the page title, metadata, and all visible copy.
- Create `src/main.ts` to import `src/style.css`.
- Create `src/style.css` for the layout and visual design.
- Modify `README.md` to add contributor instructions. Keep `.gitignore` unchanged: it already excludes `node_modules/` and `dist/`.

**Interfaces:** This task consumes no app code. It produces `GET /` and the npm commands below. No TypeScript function or data type is public.

- [ ] Create a private ESM package named `team-lunch-poll`. Set `engines.node` to `24.x` and `engines.npm` to `11.x`.
- [ ] Add these package scripts:

  | Script | Command |
  | --- | --- |
  | `dev` | `vite` |
  | `typecheck` | `tsc --noEmit` |
  | `build` | `vite build` |
  | `check` | `npm run typecheck && npm run build` |
  | `preview` | `vite preview` |

- [ ] Run `npm install --save-dev --save-exact vite@7.3.8 typescript@5.9.3`. Expect exit 0 and a root `package-lock.json`.
- [ ] Create `tsconfig.json`. Include `src`. Use `target: ES2022`, `lib: [ES2022, DOM]`, `module: ESNext`, and `moduleResolution: Bundler`. Set `strict`, `noEmit`, and `noUncheckedSideEffectImports` to `true`. Include `vite/client` in `types` for the CSS import.
- [ ] Write `index.html` with the English language, UTF-8, viewport metadata, and exact shell copy and headings from the spec. Load `/src/main.ts` as a module script. Keep all visible copy in the HTML.
- [ ] Import `./style.css` from `src/main.ts`. Use the mockup palette and layout in the stylesheet. Stack the notices below `40rem`; use two columns at `40rem` and wider. Keep the notice order. Do not add assets, controls, or motion.
- [ ] Add a “Run the app locally” section to `README.md`. Specify Node.js 24 LTS and npm 11. List `npm ci`, `npm run dev`, and `npm run check` as repository-root commands. Tell readers to open the local URL that Vite prints. Explain what the check does. Keep the existing demo workflow and source-of-truth sections.
- [ ] Run `npm ci && npm run check`. Expect exit 0, no TypeScript diagnostics, and `dist/index.html` with a generated stylesheet in `dist/assets/`.
- [ ] Run `npm run dev`. Open the printed local URL. At 320 and 1280 CSS pixels, check the exact copy, heading order, contrast, layout, and lack of horizontal overflow. Use the accessibility tree to check the labeled workspace. Use Tab to check that the shell has no dead controls or fake focus targets. With JavaScript disabled, reload and check that the heading, description, and notices remain readable. Stop the server.
- [ ] Run `npm run preview` after the check. Open the printed local URL. Expect the same content and styling as development. Check for console errors, missing assets referenced by the page, and remote requests. Ignore only a 404 from the browser's implicit `/favicon.ico` probe. Stop the server.
- [ ] Compare the README instructions with the commands used. Check that the existing Patchmill text is intact.
- [ ] Commit the task:

  ```bash
  git add package.json package-lock.json tsconfig.json index.html src/main.ts src/style.css README.md
  git diff --cached --check && git commit -m "feat: scaffold the Team Lunch Poll app"
  ```

  Expect no whitespace errors and a new commit.

**Testing Value Gate:** The shell has no poll behavior, input, parsing, or state. Do not add a suite that asserts static copy or configuration. Use the install, type check, build, and browser checks above.
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
- Final body SHA-256: `6e749917005cccfc6d765d54e5b24bc0e7e6c4ce1eaffafe25ccda975ab7b952`.
- Outcome: `ready`.
