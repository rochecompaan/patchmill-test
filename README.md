# Team Lunch Poll

Team Lunch Poll is a small greenfield demo app for trying Patchmill on a safe,
disposable repository.

The planned app lets a team create a lunch poll, add meal or restaurant options,
vote, and see the current winner. The current scaffold shows a product heading,
a description, and placeholders for poll creation and results.

Poll creation, voting, results calculation, and persistence are not available yet.
Patchmill agents build these features from the seeded issues.

## Install dependencies

Use Python 3.11 or newer. Run these commands from the repository root:

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e '.[dev]'
```

On Windows PowerShell, create and activate the environment with these commands instead:

```powershell
py -3 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e '.[dev]'
```

The app uses Flask, server-rendered HTML, and local CSS. It needs no JavaScript
build, database, credentials, or external assets.

## Run locally

With the virtual environment active, start the app:

```bash
python -m flask --app team_lunch_poll run --debug
```

Open <http://127.0.0.1:5000>. Press Ctrl+C in the terminal to stop the server.
The debug server is for local development only. Do not use it as a production server.

## Run checks

With the virtual environment active, run these commands from the repository root:

```bash
python -m pytest
python -m ruff check .
python -m ruff format --check .
```

The tests cover the homepage response, local stylesheet delivery, and unknown routes.
Ruff checks Python lint and formatting.

## File map

- `team_lunch_poll/__init__.py`: the Flask application factory and homepage route.
- `team_lunch_poll/templates/index.html`: the app shell and placeholder content.
- `team_lunch_poll/static/styles.css`: responsive layout and keyboard focus styles.
- `tests/test_app.py`: HTTP behavior tests.
- `pyproject.toml`: package metadata, dependencies, and Ruff configuration.
- `PROJECT_BRIEF.md`: product goals and scope.
- `issues/`: seeded feature prompts.
- `docs/`: the design, implementation plan, mockup, and reference screenshots.

## Demo workflow

After this repository is seeded, try Patchmill manually:

```bash
patchmill init
patchmill triage --dry-run
patchmill triage
```

## Source of truth

This repository is disposable. The reusable project brief and issue prompts live
in the Patchmill package under `fixtures/patchmill-test-repo/`.
