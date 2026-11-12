# Team Lunch Poll scaffold design

## Intent and scope

Issue #1 gives contributors a working Python web app to extend. The repository currently contains only documentation and issue prompts.

The shell introduces Team Lunch Poll and reserves space for future poll creation and results. This is a small change, not the complete product.

## Approaches

The planning agent chooses Flask, server-rendered HTML, and plain CSS. The issue delegates the setup choice to the agent. Flask supports future routes and forms without a frontend build.

Django provides useful database and administration tools, but this scaffold does not need them. Streamlit offers a quick Python UI, but gives less control over future web interactions.

These choices are proposals for the planning approval, not prior maintainer decisions.

## Requirements

- Python 3.11 or newer.
- Flask is the only direct runtime dependency. Use `Flask>=3.1,<4`.
- Use pytest and Ruff for development checks. Use `pytest>=8,<10` and `ruff>=0.11,<1`.
- No JavaScript build, external fonts, remote assets, database, or credentials.
- Provide `team_lunch_poll.create_app() -> Flask` as the application factory.
- `GET /` returns an HTML page with status 200 and a local stylesheet.
- Set the document language to `en` and the title to `Team Lunch Poll`.
- Show one main heading: `Team Lunch Poll`.
- Show this description: `Decide where or what to eat together. Create a lunch poll, vote, and find the team favorite.`
- Show a shared placeholder panel with two labeled sections.
- Use `Create a poll` with `Poll creation will appear here.`
- Use `Results` with `Team votes and the lunch winner will appear here.`
- Show `This is the app scaffold. Poll creation and voting are not available yet.` beneath the panel.
- Do not show fake data, working forms, disabled action buttons, or links to missing features.
- Unknown routes return Flask's standard 404 response.

Poll creation, domain models, voting, results calculation, persistence, authentication, deployment, and CI are outside this issue. Do not implement later seeded issues early.

## Frontend design

Frontend design applies because this issue creates a browser-visible layout and responsive styling.

Use a quiet lunch-table theme. A single shared panel suggests a place where the team makes a decision together. Avoid dashboard chrome and decorative cards.

### Tokens and layout

- Paper: `#FFFFFF`, for the page.
- Ink: `#17324D`, for headings and body text.
- Muted ink: `#486074`, for secondary text.
- Table blue: `#EDF5FA`, for the shared placeholder panel.
- Divider: `#A8BFCE`, for the boundary between future work areas.
- Focus: `#005FCC`, for keyboard focus.

Use `Trebuchet MS`, `Arial`, and `sans-serif` for all text. These local fonts keep the page independent of network services. Use a 40px desktop heading, 32px mobile heading, 22px section headings, and 16px body text with 1.6 line height.

Left-align all content within a centered 960px maximum-width main region. Use 24px mobile gutters and 48px desktop gutters. Start the content about 72px below the desktop viewport top and 40px below the mobile viewport top.

```text
Team Lunch Poll
Short product description

+---------------------------------------------------+
| Create a poll            | Results                |
| Placeholder explanation  | Placeholder explanation|
+---------------------------------------------------+
Scaffold status
```

At widths below 640px, stack the two sections and use a horizontal divider. Keep all copy visible at 320px width and at 200% browser zoom. Use no fixed heights.

### Accessibility and restraint

Use semantic `main`, `header`, `section`, `h1`, and `h2` elements. Provide a keyboard-visible skip link to the main region. Make its focus state clear. Keep the placeholder sections noninteractive.

Use a viewport meta tag. Maintain WCAG AA text contrast. Do not add animation. No reduced-motion override is necessary without motion.

The minimal-shell requirement takes precedence over generic guidance for a bold hero or rich interaction. This design uses one shared blue surface rather than a generic card grid. It requires no image, decorative icon, or marketing banner.

## Contributor workflow

Use a root package and setuptools metadata in `pyproject.toml`. Include the HTML template and CSS as package data. Set Ruff's target to Python 3.11 and line length to 88.

Document these commands from the repository root:

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e '.[dev]'
python -m flask --app team_lunch_poll run --debug
python -m pytest
python -m ruff check .
python -m ruff format --check .
```

Document `http://127.0.0.1:5000`, Ctrl+C to stop, and Windows activation with `.venv\Scripts\Activate.ps1`. Explain that the debug server is local-only, not a production server.

Keep the existing README product context and Patchmill demo instructions. Add a short file map and explain which features remain placeholders. Ignore virtual environments, Python caches, test caches, Ruff caches, and generated packaging files.

## Acceptance and verification

1. A fresh virtual environment can install the app and development dependencies with the documented command.
2. The documented Flask command serves the shell and local CSS.
3. HTTP tests prove successful HTML rendering, local CSS delivery, and a 404 for an unknown route.
4. pytest, Ruff lint, and Ruff format checks pass.
5. Desktop and mobile browser inspection confirms the mockup layout, readable text, visible skip-link focus, and no horizontal overflow.
6. Browser inspection with networking disabled confirms that the mockup opens directly from disk without external assets.

Do not add tests that only inspect README prose, dependency versions, or configuration text. Use direct inspection and the documented commands for these requirements.

## Companion artifacts

- `docs/mockups/2026-11-12-issue-1-create-the-team-lunch-poll-app-scaffold.html`: [Full-page mockup](../mockups/2026-11-12-issue-1-create-the-team-lunch-poll-app-scaffold.html)
