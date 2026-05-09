# Changelog

All notable changes to Sprint Agent. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning: [SemVer](https://semver.org).

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
