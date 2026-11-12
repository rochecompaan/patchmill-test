# Team Lunch Poll Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the sibling `executing-plans` skill for inline execution. Complete tasks in order. Steps use checkbox (`- [ ]`) syntax for tracking. Do not require subagents.

**Goal:** Provide a working Python app shell and verified contributor commands for issue #1.

**Architecture:** A Flask application factory serves one Jinja template and one local stylesheet. A root package keeps the first scaffold small. No client-side runtime or persistence is necessary.

**Tech Stack:** Python 3.11+, Flask, setuptools, pytest, Ruff, semantic HTML, plain CSS.

**Spec:** `docs/specs/2026-11-12-issue-1-create-the-team-lunch-poll-app-scaffold-design.md`

**Mockup input:** `docs/mockups/2026-11-12-issue-1-create-the-team-lunch-poll-app-scaffold.html`

## Global Constraints

- Python 3.11 or newer.
- Flask is the only direct runtime dependency. Use `Flask>=3.1,<4`.
- Use pytest and Ruff for development checks. Use `pytest>=8,<10` and `ruff>=0.11,<1`.
- No JavaScript build, external fonts, remote assets, database, or credentials.
- Preserve the exact UI copy and responsive rules in the specification.
- Do not implement poll creation, voting, calculation, persistence, authentication, deployment, or CI.
- Work only in the supplied issue worktree and branch. Never push the base branch or force-push.

## Review Focus

- A fresh environment must install package data and find the Flask application. Verify with a clean install and server smoke check.
- The CSS route must return CSS, not an HTML error. Cover this in the HTTP test.
- Unknown paths must return 404, not a misleading shell. Cover this in the HTTP test.
- Narrow viewports and 200% zoom must preserve all copy without horizontal overflow. Verify in a browser.
- Keyboard users must see the skip link and reach main content. Verify with Tab and Enter in a browser.

The Testing Value Gate selects HTTP behavior tests. Do not add tests for documentation text, dependency versions, or static configuration. Browser inspection covers layout and focus, not brittle CSS-text assertions.

## File structure

- `pyproject.toml`: setuptools build metadata, Python requirement, dependencies, dev extra, and Ruff configuration. Restrict package discovery to `team_lunch_poll*`.
- `.gitignore`: local environments, caches, and generated package files.
- `team_lunch_poll/__init__.py`: `create_app() -> Flask` and the `GET /` route.
- `team_lunch_poll/templates/index.html`: semantic shell and local CSS link.
- `team_lunch_poll/static/styles.css`: mockup styling and focus treatment.
- `tests/test_app.py`: HTTP behavior through the Flask test client.
- `README.md`: installation, local startup, checks, limitations, and file map.

## Task 1: Serve and verify the app shell

**Files:** Create `pyproject.toml`, `.gitignore`, `team_lunch_poll/__init__.py`, `team_lunch_poll/templates/index.html`, `team_lunch_poll/static/styles.css`, and `tests/test_app.py`.

**Interfaces:**
- Consumes: the specification and full-page mockup.
- Produces: `team_lunch_poll.create_app() -> Flask`, `GET /`, and `GET /static/styles.css`.
- The homepage view returns `render_template("index.html")`. Use `url_for("static", filename="styles.css")` for the stylesheet URL.

- [ ] **Step 1: Add project metadata and ignore rules.**

Use setuptools with a dev extra and the exact dependency ranges in Global Constraints. Include `templates/*.html` and `static/*.css` as package data. Set Ruff `target-version = "py311"` and `line-length = 88`. Ignore `.venv/`, `__pycache__/`, `*.py[cod]`, `.pytest_cache/`, `.ruff_cache/`, `*.egg-info/`, `build/`, and `dist/`.

- [ ] **Step 2: Create a virtual environment and install dependencies.**

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e '.[dev]'
```

Expected: the editable app and dev tools install successfully.

- [ ] **Step 3: Write the HTTP behavior tests.**

Create a pytest client fixture from `create_app()`. Enable `TESTING` on the app. Define these tests:

1. `test_home_serves_html_shell`: request `/`. Assert status 200, HTML MIME type, an English document, one `h1` with `Team Lunch Poll`, both placeholder headings, and a main region. Assert the response links to `/static/styles.css`.
2. `test_local_stylesheet_is_served`: request `/static/styles.css`. Assert status 200, MIME type `text/css`, and a nonempty body.
3. `test_unknown_route_returns_404`: request `/not-a-route`. Assert status 404.

These assertions protect actual route, template, and asset integration rather than snapshotting all copy or CSS values.

- [ ] **Step 4: Run the tests before implementation.**

Run `python -m pytest -q`. Expected: collection fails because `team_lunch_poll` does not exist. Do not treat dependency errors as the intended failure.

- [ ] **Step 5: Implement `create_app() -> Flask` and its homepage.**

Construct `Flask(__name__)`, register the root route, and return the app. No global mutable application state is necessary. Port the mockup markup into `index.html`. Move its embedded CSS into `styles.css` and link it with `url_for`. Preserve all specified copy, semantic landmarks, skip-link behavior, tokens, and the 640px layout breakpoint.

- [ ] **Step 6: Run automated checks.**

```bash
python -m pytest -q
python -m ruff check .
python -m ruff format --check .
```

Expected: three passing tests and successful lint and format checks. Apply formatting corrections and repeat checks if necessary.

- [ ] **Step 7: Inspect the running UI.**

Run `python -m flask --app team_lunch_poll run --debug`. Open `http://127.0.0.1:5000`. Inspect at 1280px, 375px, and 320px widths. Inspect at 200% browser zoom. Verify wrapping, section stacking, no horizontal overflow, and no external asset requests. Press Tab to reveal the skip link. Press Enter to reach main content. Stop the server with Ctrl+C.

Use the repository's `patchmill-visual-evidence` skill to capture and commit implementation reference screenshots. The mockup is not implementation evidence. Use `patchmill-frontend-review` after implementation validation for this user-visible change.

- [ ] **Step 8: Commit the app shell and tests.**

```bash
git add pyproject.toml .gitignore team_lunch_poll tests
git commit -m "feat: scaffold the Team Lunch Poll Flask app"
```

## Task 2: Document and prove the contributor workflow

**Files:** Modify `README.md`.

**Interfaces:**
- Consumes: `create_app()` and the verified CLI behavior from Task 1.
- Produces: contributor instructions that work from the repository root.

- [ ] **Step 1: Add installation, startup, and check instructions.**

Preserve the existing product context and Patchmill demo workflow. Add the exact commands from the specification, Python 3.11+ as a prerequisite, and Windows virtual-environment activation. State the local URL, Ctrl+C shutdown, and local-only debug-server restriction. Add the file map and clearly identify the unfinished poll features.

- [ ] **Step 2: Reproduce installation in a fresh temporary virtual environment.**

Install `.[dev]` from the repository with that environment's Python. Run pytest and both Ruff checks with that Python. Expected: installation and checks pass without dependencies from the earlier environment.

- [ ] **Step 3: Smoke-check startup from outside the repository.**

From a temporary directory, use the fresh environment's Python to run `-m flask --app team_lunch_poll run --port 5051`. Request `/` and `/static/styles.css` with curl. Expected: status 200 for both resources. This proves installed template and asset discovery. Stop the server and remove temporary artifacts.

- [ ] **Step 4: Review the README directly.**

Verify command order, quoting, activation paths, local URL, debug warning, and file names. No automated documentation-text test is necessary.

- [ ] **Step 5: Commit documentation and deliver.**

```bash
git add README.md
git commit -m "docs: explain local app setup and checks"
```

Run the full checks again, inspect `git diff --check` and `git status`, and push only the supplied issue branch. Follow the implementation session's delivery instructions for the implementation PR.

## Planning self-review

The two tasks cover all specification requirements. HTTP tests cover homepage rendering, asset delivery, and unknown paths. Fresh-install checks cover setup and packaged resources. Browser inspection covers responsive layout, keyboard focus, zoom, and network independence. No later poll feature is part of this plan.
