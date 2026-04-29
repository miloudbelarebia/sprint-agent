# Contributing to Sprint Agent

Thanks for your interest! Sprint Agent stays small and focused — pure Python stdlib, single file, opinionated defaults.

## Quick start

```bash
git clone https://github.com/miloudbelarebia/sprint-agent
cd sprint-agent
python sprint_agent.py --help
```

Sanity check that everything runs:

```bash
mkdir /tmp/sa-test && cd /tmp/sa-test
python /path/to/sprint_agent.py init --name "test"
python /path/to/sprint_agent.py status
python /path/to/sprint_agent.py backlog add "test ticket" --priority P1 --effort S
```

## Guiding principles

1. **Zero dependencies.** Pure Python stdlib only. No `pip install` for anything.
2. **Single file.** `sprint_agent.py` stays the entire tool. Don't split into modules.
3. **Markdown over databases.** Sprint state lives in `.md` files readable by humans and AI.
4. **Convention over configuration.** Opinionated defaults. New options must justify themselves.
5. **Python 3.8+** compatibility. No walrus inside f-strings, no `match`, no `:=` where 3.8 chokes.

## Pull requests

- Keep changes focused — one concern per PR.
- Run the smoke test above before submitting.
- Update `CHANGELOG.md` under `## Unreleased`.
- If adding a flag, update the README's commands reference table.
- If touching the AI agent templates (`AGENT.md`, `CLAUDE.md`, `.cursorrules`), test with at least one real agent.

## Reporting issues

Open an issue with:
- Python version (`python --version`)
- OS
- Command you ran
- Expected vs actual output
