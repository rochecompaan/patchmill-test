# Team Lunch Poll Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan inline, task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. No subagent tools are required.

**Goal:** Create a runnable TypeScript app shell with honest poll placeholders and documented contributor commands.

**Architecture:** Vite serves one page with semantic HTML. A small TypeScript entry imports the stylesheet. No runtime framework or state layer is necessary.

**Tech Stack:** Node.js 24 LTS, npm 11, TypeScript, Vite, HTML, CSS.

**Spec:** [Scaffold design](../specs/2026-11-04-issue-1-create-the-team-lunch-poll-app-scaffold-design.md).

**Mockup input:** [Full-page mockup](../mockups/2026-11-04-issue-1-create-the-team-lunch-poll-app-scaffold.html).

## Global Constraints

- Use Node.js 24 LTS and npm 11.
- Use compatible stable Vite and TypeScript releases at implementation time.
- Commit the npm lockfile.
- No runtime dependencies are necessary.
- The root page has the document title and single h1 `Team Lunch Poll`.
- The placeholders contain no buttons, forms, fake votes, or charts.
- No poll logic, persistence, backend, routing, or deployment belongs in this issue.
- Preserve existing project documents and demo instructions.

## Review Focus

These conditions need direct inspection, not static text tests. Task 1 owns each check.

1. A fresh checkout installs with `npm ci` and uses the documented commands.
2. At 320px width and 200% zoom, text remains readable without horizontal overflow.
3. Keyboard navigation exposes the skip link and moves focus to the main content.
4. Production preview loads styles and content without missing assets or console errors.
5. The empty sections clearly communicate unavailable features without fake controls or data.

## File map

| File | Responsibility |
| --- | --- |
| `package.json` | Private npm package, scripts, Node engine, development dependencies. |
| `package-lock.json` | Reproducible dependency resolution. |
| `tsconfig.json` | Strict, browser-oriented TypeScript checks without output. |
| `index.html` | Document metadata, semantic app shell, module entry reference. |
| `src/main.ts` | Import `./style.css` as the browser entry. |
| `src/style.css` | Tokens, layout, typography, responsive rules, keyboard focus. |
| `.gitignore` | Ignore dependency and build output directories. |
| `README.md` | Contributor setup, commands, current scope, and existing repository context. |

No Vite configuration file is necessary. Default root and output paths meet the spec.

## Verification choice

The Testing Value Gate excludes automated tests that only assert fixed copy or configuration. This issue introduces no stateful behavior or business logic. Do not add a test framework or artificial failing tests. Use strict TypeScript checks, production compilation, clean installation, and direct browser inspection. Future behavior requires meaningful tests in its owning issue.

---

### Task 1: Deliver the runnable scaffold and contributor workflow

**Files:** Create each file in the file map except `README.md`, which already exists and needs targeted edits.

**Interfaces:**

- Consumes: the spec copy and tokens, mockup layout, and existing README context.
- Produces: `npm run dev`, `npm run check`, `npm run build`, and `npm run preview` at the repository root.
- Produces: `/` with two named placeholder sections and no application state or exported functions.

- [x] **Step 1: Add the toolchain manifest.**

Create a private package named `team-lunch-poll`, with module type `module` and Node engine `>=24.0.0 <25`. Add compatible stable Vite and TypeScript development dependencies. Define these scripts:

```json
{
  "dev": "vite",
  "check": "tsc --noEmit",
  "build": "npm run check && vite build",
  "preview": "vite preview"
}
```

- [x] **Step 2: Add TypeScript configuration and ignored paths.**

Use `target: ES2022`, DOM libraries, `module: ESNext`, `moduleResolution: Bundler`, `strict: true`, `noEmit: true`, and `include: ["src"]`. Include `vite/client` types for CSS imports. Ignore `node_modules/` and `dist/`.

- [x] **Step 3: Create the app shell.**

Adapt the mockup into `index.html` and `src/style.css`. Preserve the spec's exact copy, heading hierarchy, tokens, skip link, and responsive order. Add `<script type="module" src="/src/main.ts"></script>`. Create `src/main.ts` with the stylesheet import. Do not add template logos, counters, dead buttons, or poll behavior.

- [x] **Step 4: Install dependencies.**

Run `npm install` from the root. Expect a successful installation and a new lockfile. Resolve incompatible tool versions before proceeding.

- [x] **Step 5: Document contributor commands.**

Update `README.md` with the Node/npm prerequisites and all six commands in the spec. Explain the printed development URL, the `dist/` build, and preview's build prerequisite. State the current scaffold limits and absence of automated behavior tests. Preserve the existing demo workflow and source-of-truth notes.

- [x] **Step 6: Verify a reproducible build.**

Run `npm ci`, `npm run check`, and `npm run build`. Expect exit code 0 for all commands and generated `dist/` output. Verify that Git does not include generated files.

- [x] **Step 7: Inspect the development app.**

Run `npm run dev -- --host 127.0.0.1`. Open the printed URL in a browser. Inspect at 320px and 1280px widths and at 200% zoom. Verify no horizontal overflow, complete readable content, one h1, two h2 headings, and honest empty sections. Use Tab and Enter to verify the visible skip link and main focus target. Verify text contrast meets WCAG AA and the page stays static with reduced motion enabled. Stop the server after inspection.

- [x] **Step 8: Inspect the production app.**

Run `npm run preview -- --host 127.0.0.1`. Open the printed URL. Expect the same shell, loaded styles, no missing assets, and no console errors. Stop the preview server after inspection.

- [x] **Step 9: Capture delivery evidence.**

Follow the repository's `patchmill-visual-evidence` skill for implementation screenshots. Follow `patchmill-frontend-review` for the visible UI review. The planning mockup is not a substitute for implementation evidence. Record actual verification results and any environment limitations.

- [x] **Step 10: Review and commit the deliverable.**

Run `git diff --check`. Review the changes against the spec and mockup. Confirm that all five Review Focus checks have evidence. Stage only the intended source, lockfile, documentation, and required visual evidence. Commit with `feat: create Team Lunch Poll app scaffold`.

## Planning self-review

The task covers the shell, exact copy, responsive design, accessibility, toolchain, documented commands, and verification requirements. There are no cross-task type interfaces. Compiler/build and direct browser checks replace low-value static assertions. Execution remains inline on the supplied implementation branch.
