# Sprint Agent

**Turn any AI agent into an agile developer.**

Sprint Agent gives AI coding agents (Claude Code, Cursor, Copilot, Aider, Windsurf) persistent memory and structured workflow — so they stop wasting tokens re-reading your codebase and start shipping like a teammate.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-3776AB.svg)](https://python.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-green.svg)]()

---

## The Problem

Every time you start a new session with an AI agent, it wastes time re-reading your entire codebase:

```
                WITHOUT Sprint Agent

  Session 1          Session 2          Session 3
  ┌────────────┐    ┌────────────┐    ┌────────────┐
  │ ░░░░░░░░░░ │    │ ░░░░░░░░░░ │    │ ░░░░░░░░░░ │
  │ Read 50    │    │ Read 50    │    │ Read 50    │
  │ files      │    │ files      │    │ files      │  WASTE
  │ again      │    │ again      │    │ again      │
  │ ░░░░░░░░░░ │    │ ░░░░░░░░░░ │    │ ░░░░░░░░░░ │
  │            │    │            │    │            │
  │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │
  │ Actual     │    │ Actual     │    │ Actual     │  WORK
  │ work       │    │ work       │    │ work       │
  └────────────┘    └────────────┘    └────────────┘

  Context: ~12,300 tokens wasted per session
  No memory between sessions
  Agent doesn't know what was done yesterday
```

```
                WITH Sprint Agent

  Session 1          Session 2          Session 3
  ┌────────────┐    ┌────────────┐    ┌────────────┐
  │ ░░ sprint  │    │ ░░ sprint  │    │ ░░ sprint  │  2 min
  │            │    │            │    │            │
  │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │
  │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │
  │ ▓▓ Actual ▓ │    │ ▓▓ Actual ▓ │    │ ▓▓ Actual ▓ │  WORK
  │ ▓▓ work   ▓ │    │ ▓▓ work   ▓ │    │ ▓▓ work   ▓ │
  │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │
  │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │    │ ▓▓▓▓▓▓▓▓▓▓ │
  └────────────┘    └────────────┘    └────────────┘

  Context: ~2,100 tokens (83% reduction)
  Full memory: what's done, what's next, what failed
  Agent picks up exactly where it left off
```

---

## Installation

Two ways — same tool, your choice:

```bash
# Option A: pip install (recommended)
pip install sprint-agent
sprint-agent init

# Option B: standalone (zero install)
curl -O https://raw.githubusercontent.com/2pidata/sprint-agent/main/sprint_agent.py
python sprint_agent.py init
```

---

## Quick Start

```bash
# 1. Initialize in your project
sprint-agent init --name "My SaaS" --daily 30 --agent claude

# 2. Check today's status
sprint-agent status

# 3. Add tickets to the backlog
sprint-agent backlog add "Fix auth redirect" --priority P1 --effort S
sprint-agent backlog add "Add E2E tests" --priority P2 --effort L --sprint S03

# 4. Plan next sprint
sprint-agent sprint new --goal "Launch payment flow"

# 5. Friday retro
sprint-agent retro

# 6. Save to git
sprint-agent sync
```

After `init`, your project gets a `.sprint/` directory:

```
your-project/
├── .sprint/
│   ├── AGENT.md              ← AI agent reads this first (auto-loaded)
│   ├── backlog.md            ← Prioritized product backlog
│   ├── config.yaml           ← Sprint settings (daily duration, etc.)
│   ├── sprints/
│   │   └── S01_2025-01-06.md ← Weekly sprint with daily breakdown
│   ├── retros/
│   │   └── RETRO_S01.md      ← Friday retrospective
│   └── sessions/
│       └── (auto-created)
├── CLAUDE.md                 ← Auto-generated (Claude Code reads this)
└── .cursorrules              ← Auto-generated (Cursor reads this)
```

---

## How It Works

```
  You                   Sprint Agent              AI Agent
   │                        │                        │
   │  sprint-agent init     │                        │
   │───────────────────────>│                        │
   │                        │  Creates .sprint/      │
   │                        │  + AGENT.md            │
   │                        │  + backlog.md          │
   │                        │  + sprint S01          │
   │                        │                        │
   │  "Start working"       │                        │
   │────────────────────────────────────────────────>│
   │                        │                        │
   │                        │   Reads .sprint/ ──────│
   │                        │                        │
   │                        │   Knows instantly:      │
   │                        │   ● Sprint S03, Day 2   │
   │                        │   ● 3/8 tickets done    │
   │                        │   ● Next: fix auth bug  │
   │                        │   ● Blocker: DB migrate  │
   │                        │                        │
   │                        │   Works 28 min ────────>│
   │                        │   Updates sprint ──────>│
   │                        │                        │
   │   "Done for today"     │                        │
   │<────────────────────────────────────────────────│
   │                        │                        │
   │  sprint-agent sync     │                        │
   │───────────────────────>│  git commit + push     │
   │                        │                        │
```

---

## The Token Cost — Real Numbers

*Measured on [DataFrancePro](https://datafrancepro.fr) (5M company database, 70+ tickets, 6 sprints):*

| What the agent reads | Without | With Sprint Agent |
|---------------------|---------|-------------------|
| Instructions file | 6,200 tokens | 200 tokens |
| Session history | 5,100 tokens | 0 (in sprint) |
| State/status file | 1,600 tokens | 0 (in sprint) |
| Sprint file | — | 1,900 tokens |
| **Total context** | **~12,300** | **~2,100** |
| **Reduction** | | **83%** |

**Time impact (measured across 10 sessions):**

| Metric | Without | With | Gain |
|--------|---------|------|------|
| Context loading | 8-15 min | 2 min | **4-7x faster** |
| Work time / 30min | 15-22 min | 28 min | **+50%** |
| Repeated exploration | Every session | Never | Eliminated |

> **Methodology**: Tokens at ~4 bytes/token. Time = session start to first code edit. 10 daily sessions, April 2026. Before = no agile structure. After = Sprint Agent.

---

## The Agile Model

Sprint Agent implements lightweight agile for **solo dev + AI agent** pairs:

```
┌──────────────────── WEEK ─────────────────────┐
│                                                │
│  Mon      Tue      Wed      Thu      Fri       │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐ │
│  │DAILY│  │DAILY│  │DAILY│  │DAILY│  │RETRO│ │
│  │ 30m │  │ 30m │  │ 30m │  │ 30m │  │ 15m │ │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘ │
│                                                │
│  Daily = status + 1 ticket + update            │
│  Retro = review + plan next week               │
│                                                │
│  Total: 2h15 focused work per week             │
│  Result: 5-10 tickets shipped per sprint       │
└────────────────────────────────────────────────┘
```

### The Sprint Cycle

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ BACKLOG  │────>│  SPRINT  │────>│  DAILY   │────>│  RETRO   │
│          │     │          │     │          │     │          │
│ All work │     │ This week│     │ Today's  │     │ Review   │
│ P0 → P4  │     │ 5-8      │     │ ticket   │     │ Score    │
│ Icebox   │     │ tickets  │     │ 30 min   │     │ Improve  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     v                v                v                v
 backlog.md      sprint.md      sprint.md [x]     retro.md
```

---

## Agent Compatibility

Works with any AI coding agent that reads project files:

| Agent | Auto-config file | How it works |
|-------|-----------------|--------------|
| **Claude Code** | `CLAUDE.md` | Auto-read at session start |
| **Cursor** | `.cursorrules` | Auto-read at session start |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Manual read |
| **Aider** | `.aider.conf.yml` | Manual read |
| **Windsurf** | `.windsurfrules` | Auto-read at session start |
| **Any agent** | — | Tell it: "Read `.sprint/AGENT.md`" |

---

## Commands Reference

### `sprint-agent init [options]`

Initialize `.sprint/` directory with templates and agent config.

| Option | Default | Description |
|--------|---------|-------------|
| `--name <name>` | directory name | Project name |
| `--daily <min>` | `30` | Daily session duration (minutes) |
| `--days <n>` | `5` | Working days per sprint |
| `--retro-day <day>` | `friday` | Retrospective day |
| `--agent <type>` | `auto` | `claude` `cursor` `copilot` `aider` `windsurf` |
| `--force` | — | Overwrite existing `.sprint/` |

```bash
sprint-agent init                                    # defaults: 30min, 5 days
sprint-agent init --daily 45 --days 4                # custom schedule
sprint-agent init --name "My SaaS" --agent claude    # named project
sprint-agent init --daily 120 --days 2 --retro-day sunday  # weekend warrior
```

### `sprint-agent status`

Show today's context: date, sprint, progress bar, remaining tickets.

```
╔══════════════════════════════════════════════╗
║          Sprint Agent — Daily Status          ║
╠══════════════════════════════════════════════╣
║  Date    : 2025-01-15 (Wednesday)            ║
║  Sprint  : S03  (day 3/5)                    ║
║  Progress: ████████████░░░░░░░░░░░░░ 48%     ║
║  Daily   : 30 min session                    ║
╚══════════════════════════════════════════════╝

Remaining tickets:
  ○ P2-01: Add rate limiting to /api/search
  ○ P2-02: Mobile responsive dashboard
```

### `sprint-agent sprint new [options]`

Create the next weekly sprint.

| Option | Default | Description |
|--------|---------|-------------|
| `--goal <text>` | `TBD` | Sprint goal |
| `--daily <min>` | from config | Override daily duration |
| `--days <n>` | from config | Override working days |

```bash
sprint-agent sprint new --goal "Launch MVP auth + payment"
```

### `sprint-agent backlog add <description> [options]`

Add a prioritized ticket to the backlog.

| Option | Default | Description |
|--------|---------|-------------|
| `--priority <P0-P4>` | `P2` | Priority level |
| `--effort <XS-XL>` | `M` | Effort estimate |
| `--sprint <id>` | — | Assign to sprint (e.g. `S03`) |

```bash
sprint-agent backlog add "Fix auth redirect loop" --priority P1 --effort S
sprint-agent backlog add "Add E2E Playwright tests" --priority P2 --effort L --sprint S03
sprint-agent backlog add "Security audit" --priority P0 --effort XL
```

### Other commands

| Command | Description |
|---------|-------------|
| `sprint-agent backlog list` | Display full backlog |
| `sprint-agent retro` | Generate Friday retrospective template |
| `sprint-agent config` | Show current configuration |
| `sprint-agent sync` | Git commit + push `.sprint/` changes |
| `sprint-agent --version` | Show version |

---

## Configuration

```yaml
# .sprint/config.yaml — edit to customize
project:
  name: "My SaaS App"

sprint:
  duration: 7              # calendar days per sprint
  days_per_sprint: 5       # working days
  daily_duration: 30       # minutes per session
  retro_day: friday
  start_day: monday

agent:
  type: auto               # auto | claude | cursor | copilot | aider | windsurf

priorities:
  P0: "Critical — blockers, security, data loss"
  P1: "High — must ship this sprint"
  P2: "Medium — next sprint"
  P3: "Low — this quarter"
  P4: "Nice-to-have — someday/maybe"

effort:
  XS: "< 30 min"
  S:  "~1 hour"
  M:  "2-4 hours (1 daily)"
  L:  "4-8 hours (2-3 dailies)"
  XL: "> 1 day (break it down)"
```

---

## What Gets Generated

### AGENT.md (read by AI at session start)

```markdown
# AI Agent Instructions — Sprint Agent

## Your Workflow (every session)
1. Read this file
2. Read `.sprint/sprints/` latest file
3. Pick the next TODO ticket
4. Work for 30 minutes
5. Update the sprint file
6. Commit with ticket ID

## Rules
- 1 daily = 1 ticket (unless XS)
- Verify deploys after push
- Document blockers in sprint file
- Friday = retrospective

## Project Context
> (you add your project details here)
```

### Sprint file (one per week)

```markdown
# Sprint S03 — Week of 2025-01-20

> Goal: Launch auth + payment
> Capacity: 5 x 30min = 2.5h

## Monday — DONE
- [x] T-012: Fix auth redirect loop

## Tuesday — TODAY
- [ ] T-013: Add Stripe checkout flow

## Wednesday
- [ ] T-014: Webhook signature verify

## Metrics
| Metric | Start | End   |
|--------|-------|-------|
| Tests  | 45    | 52    |
```

### Retrospective (every Friday)

```markdown
# Retrospective S03 — 2025-01-24

## 1. What went well
- Auth flow shipped in 2 dailies

## 2. What didn't go well
- Stripe webhook took longer than expected

## 3. Actions for next sprint
- [ ] Add webhook retry logic
- [ ] Write E2E tests for payment

## 4. Score
- Productivity: 4/5
```

---

## Real-World Results

Battle-tested building [DataFrancePro](https://datafrancepro.fr) — a B2B SaaS platform with 5M+ French companies:

| Sprint | Duration | Tickets | Highlights |
|--------|----------|---------|------------|
| S01-S04 | 4 weeks | ~30 | Infra, ETL pipeline, 5M migration, security |
| S05 | 1 week | 32 | Admin dashboard, web scraping, 80 tests |
| S06 | 1 week | 10 | Stripe audit, MCP protocol, accessibility |

**6 sprints. 70+ tickets. 1 developer. 30-minute daily sessions.**

---

## Philosophy

1. **Markdown over databases** — `.md` files readable by humans AND AI agents
2. **Convention over configuration** — Opinionated defaults, override what you need
3. **Agent-first design** — Optimized for AI context windows, not human dashboards
4. **Git-native** — Sprint history is version-controlled; diffs show progress
5. **Zero dependencies** — Pure Python stdlib; your sprint files work without Sprint Agent installed
6. **Single-file distribution** — One `.py` file = standalone tool OR pip package

---

## Contributing

```bash
git clone https://github.com/2pidata/sprint-agent
cd sprint-agent
python sprint_agent.py --help    # test locally
python sprint_agent.py init      # test init
```

Issues and PRs welcome: [github.com/2pidata/sprint-agent/issues](https://github.com/2pidata/sprint-agent/issues)

---

## License

MIT — [2PiData](https://2pidata.fr)

**Built by [Miloud Belarebia](https://github.com/miloudbelarebia) — Founder of [2PiData](https://2pidata.fr)**

*Tested in production: DataFrancePro, 5M+ companies, 70+ tickets, 6 sprints, one developer + Claude Code.*
