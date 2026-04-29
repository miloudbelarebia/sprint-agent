# Changelog

All notable changes to Sprint Agent. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning: [SemVer](https://semver.org).

## [0.4.0] — 2026-04-29

### Added
- Support for OpenAI Codex (`AGENTS.md`) and Gemini agent types
- `Operating System :: OS Independent` and Python 3.9–3.12 classifiers
- `CONTRIBUTING.md` and `CHANGELOG.md`
- GitHub Actions CI: lint + smoke test on Python 3.8–3.12

### Changed
- Repo moved from `2pidata/sprint-agent` → `miloudbelarebia/sprint-agent`
- Package renamed to `sprint-agent-cli` for PyPI (the `sprint-agent` name is taken)
- README install instructions: standalone curl is now the primary method
- LICENSE copyright simplified to `Miloud Belarebia`

### Removed
- Duplicate `sprintkit.py` (legacy from rename); only `sprint_agent.py` remains
- `sprintkit` console-script alias

### Fixed
- Status box header alignment (was off by 4 chars)

## [0.3.0] — earlier

- Full rewrite in Python, zero dependencies, two install modes (standalone + pip)

## [0.2.0]

- CLI parameters (`--daily`, `--days`, `--retro-day`, `--agent`)
- Real metrics in README
- Multi-agent support (Claude Code, Cursor, Copilot, Aider, Windsurf)

## [0.1.0]

- Initial release as SprintKit
