# Sprint Agent v0.4.0

**Persistent sprint context for AI coding agents — now with full agent matrix, tests, and CI.**

## Highlights

- **Full agent compatibility matrix** — Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Gemini, Aider, Windsurf
- **Auto-generated config files** — `CLAUDE.md`, `.cursorrules`, `AGENTS.md` based on `--agent`
- **Battle-tested foundation** — 16 pytest tests, lint clean, CI on Python 3.8 → 3.12 across macOS / Linux / Windows
- **Single source of truth** — unified `sprint_agent.py`, removed legacy `sprintkit.py` duplicate
- **Trusted publisher PyPI** — automated release pipeline via OIDC

## What's new

### Added
- OpenAI Codex support via `AGENTS.md`
- Gemini documented workflow
- Windsurf in `--agent` choices
- `daily` command as alias for `status`
- pytest suite (16 tests covering init / status / backlog / sprint / retro / config)
- GitHub Actions: CI matrix + automated PyPI publish on release
- Issue templates (bug / feature) + PR template + Discussions link
- CHANGELOG.md following Keep a Changelog
- Reproducible demo script: `scripts/demo.sh`

### Changed
- README hero with PyPI / CI / downloads / stars badges
- Single canonical module `sprint_agent.py`
- Entry point unified to `sprint-agent`
- Promoted classifier to Beta (`Development Status :: 4 - Beta`)
- Expanded keywords for PyPI discoverability

### Fixed
- Version string consistency across `pyproject.toml` and `__version__`
- Lint cleanup (E741 ambiguous variable names)

## Install

```bash
pip install sprint-agent
sprint-agent init
```

Or standalone (zero install):

```bash
curl -O https://raw.githubusercontent.com/miloudbelarebia/sprint-agent/main/sprint_agent.py
python sprint_agent.py init
```

## Upgrading from 0.3.0

No breaking changes for end users. The `sprintkit` entry point alias was removed — if you were calling `sprintkit` instead of `sprint-agent`, switch to `sprint-agent`.

---

**Full changelog:** [CHANGELOG.md](https://github.com/miloudbelarebia/sprint-agent/blob/main/CHANGELOG.md)
