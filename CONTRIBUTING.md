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

## Internal notes

### YAML config parser

The config parser in `read_config()` is **not a full YAML parser** — it is a deliberately tiny key/value reader sized to what `.sprint/config.yaml` actually needs:

- Two-level nesting: top-level section header (e.g. `sprint:`) followed by 2-space-indented `key: value` pairs.
- String / int values, optional `# comments` after the value, optional `'`/`"` quotes around the value.

What it does **not** support (intentionally — adding a YAML dependency would break the zero-dep promise):

- Multi-line strings, block scalars (`|`, `>`)
- Lists, nested mappings beyond two levels
- Anchors, references, multi-document files

The `priorities:` and `effort:` blocks in the generated `config.yaml` are documentation for the human reader — the code does not consume them. If you add a new config key, keep it flat under an existing section, or add a new top-level section.

### `--force` and user files

`init --force` can overwrite three files at the project root: `CLAUDE.md`, `.cursorrules`, `AGENTS.md`. To avoid silent data loss when a user has customized any of these, the existing file is renamed to `<file>.bak` before the new version is written. Tests in `tests/test_sprint_agent.py` enforce this contract — keep them green.

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
