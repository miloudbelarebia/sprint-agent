# Changelog

All notable changes to Sprint Agent. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning: [SemVer](https://semver.org).

## [Unreleased]

### Added
- `backup_if_exists()` helper: `init --force` now writes `<file>.bak` for `CLAUDE.md`, `.cursorrules`, and `AGENTS.md` before overwriting them, so user customizations survive a re-init
- 4 new pytest cases covering `--days` configurability and the new backup-on-`--force` contract (20 total, all green)
- CONTRIBUTING.md: internal notes section documenting the YAML parser scope and the `--force` backup contract

### Changed
- README: install section now leads with `pip install sprint-agent` (Option A), standalone curl is Option B
- README: example dates bumped from 2025 to 2026 across all snippets
- README: methodology disclaimer expanded — clarifies "personal benchmark, single developer" and warns that the 83% number is directional
- README roadmap: removed `[ ] PyPI publish as sprint-agent-cli` (already shipped under `sprint-agent`); reframed VSCode/Cursor extension as a companion repo so it does not break the single-file core promise
- `pyproject.toml`: `Homepage` now points to the GitHub Pages landing (`https://miloudbelarebia.github.io/sprint-agent/`); kept the repo URL under `Repository` and added a `Documentation` URL

### Fixed
- `sprint-agent status` no longer hardcodes `/5` — it now reads `days_per_sprint` from `config.yaml`, so users with `--days 4` (or any other value) see the correct day counter

## [0.4.0] — 2026-05-09

### Added
- Support for OpenAI Codex (`AGENTS.md`) and Gemini agent types
- `Operating System :: OS Independent` and Python 3.9–3.12 classifiers
- `CONTRIBUTING.md` and `CHANGELOG.md`
- GitHub Actions CI: lint, pytest suite, and end-to-end smoke on Python 3.8 / 3.10 / 3.12 across Linux / macOS / Windows
- pytest test suite (`tests/test_sprint_agent.py`) — 16 tests covering init, status, backlog, sprint new, retro, config
- Trusted Publishers PyPI release workflow (OIDC, no token) — auto-publishes on GitHub Release
- Issue templates (bug + feature) and PR template
- Discussions link via `.github/ISSUE_TEMPLATE/config.yml`
- `scripts/demo.sh` — reproducible terminal demo (alternative to `demo.tape` VHS)
- README hero badges: PyPI version, CI status, downloads, Python versions, GitHub stars
- Promoted classifier to `Development Status :: 4 - Beta`

### Changed
- Repo moved from `2pidata/sprint-agent` → `miloudbelarebia/sprint-agent`
- Package published on PyPI as `sprint-agent` (single canonical name)
- LICENSE copyright simplified to `Miloud Belarebia`
- Expanded keywords for PyPI discoverability (claude-code, cursor, codex, gemini, etc.)
- pyproject.toml: added pytest config, ruff config, and `[test]` / `[dev]` optional dependencies

### Removed
- Duplicate `sprintkit.py` (legacy from rename); only `sprint_agent.py` remains
- `sprintkit` console-script alias

### Fixed
- Status box header alignment (was off by 4 chars)
- Lint cleanup (E741 ambiguous variable names)

## [0.3.0] — earlier

- Full rewrite in Python, zero dependencies, two install modes (standalone + pip)

## [0.2.0]

- CLI parameters (`--daily`, `--days`, `--retro-day`, `--agent`)
- Real metrics in README
- Multi-agent support (Claude Code, Cursor, Copilot, Aider, Windsurf)

## [0.1.0]

- Initial release as SprintKit

[0.4.0]: https://github.com/miloudbelarebia/sprint-agent/releases/tag/v0.4.0
[0.3.0]: https://github.com/miloudbelarebia/sprint-agent/releases/tag/v0.3.0
[0.2.0]: https://github.com/miloudbelarebia/sprint-agent/releases/tag/v0.2.0
[0.1.0]: https://github.com/miloudbelarebia/sprint-agent/releases/tag/v0.1.0
