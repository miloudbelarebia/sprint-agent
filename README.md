# Sprint Agent

**Turn any AI agent into an agile developer.**

Sprint Agent gives AI coding agents (Claude Code, Cursor, Copilot, Aider) persistent memory and structured workflow — so they stop wasting tokens re-reading your codebase and start shipping like a teammate.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-coming_soon-orange.svg)]()

---

## The Problem

Every time you start a new session with an AI agent:

```
┌─────────────────────────────────────────────────────────┐
│                   WITHOUT Sprint Agent                      │
│                                                          │
│  Session 1        Session 2        Session 3             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │ Read 50  │    │ Read 50  │    │ Read 50  │           │
│  │ files    │    │ files    │    │ files    │ ← WASTE   │
│  │ again    │    │ again    │    │ again    │           │
│  │          │    │          │    │          │           │
│  │ 20min    │    │ 20min    │    │ 20min    │           │
│  │ context  │    │ context  │    │ context  │           │
│  │ loading  │    │ loading  │    │ loading  │           │
│  │          │    │          │    │          │           │
│  │ 10min    │    │ 10min    │    │ 10min    │           │
│  │ actual   │    │ actual   │    │ actual   │           │
│  │ work     │    │ work     │    │ work     │           │
│  └──────────┘    └──────────┘    └──────────┘           │
│                                                          │
│  🔥 67% of tokens wasted on re-reading context           │
│  🔥 No memory between sessions                           │
│  🔥 Agent doesn't know what was done yesterday            │
│  🔥 No progress tracking                                 │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│                   WITH Sprint Agent                         │
│                                                          │
│  Session 1        Session 2        Session 3             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │ Read     │    │ Read     │    │ Read     │           │
│  │ sprint   │    │ sprint   │    │ sprint   │ ← 2 min  │
│  │ file     │    │ file     │    │ file     │           │
│  │ (2 min)  │    │ (2 min)  │    │ (2 min)  │           │
│  │          │    │          │    │          │           │
│  │          │    │          │    │          │           │
│  │ 28min    │    │ 28min    │    │ 28min    │           │
│  │ actual   │    │ actual   │    │ actual   │ ← WORK   │
│  │ work     │    │ work     │    │ work     │           │
│  │          │    │          │    │          │           │
│  └──────────┘    └──────────┘    └──────────┘           │
│                                                          │
│  ✅ 93% of tokens spent on actual work                   │
│  ✅ Full memory: what's done, what's next, what failed   │
│  ✅ Agent picks up exactly where it left off              │
│  ✅ Sprint progress visible to you                       │
└─────────────────────────────────────────────────────────┘
```

## How It Works

```
 You                    Sprint Agent                   AI Agent
  │                        │                           │
  │  sprint-agent init    │                           │
  │───────────────────────>│                           │
  │                        │  Creates:                 │
  │                        │  .sprint/                 │
  │                        │  ├── CLAUDE.md            │
  │                        │  ├── backlog.md           │
  │                        │  ├── current-sprint.md    │
  │                        │  ├── daily-status.sh      │
  │                        │  └── retros/              │
  │                        │                           │
  │  "Start working"       │                           │
  │───────────────────────────────────────────────────>│
  │                        │                           │
  │                        │  Agent reads .sprint/     │
  │                        │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
  │                        │                           │
  │                        │  Knows:                   │
  │                        │  • Sprint S03, Day 2/5    │
  │                        │  • 3 tickets done         │
  │                        │  • Next: P1-04 auth bug   │
  │                        │  • Yesterday: fixed API   │
  │                        │  • Blocker: DB migration  │
  │                        │                           │
  │                        │  Starts working           │
  │                        │  immediately ──────────>  │
  │                        │                           │
  │                        │  Updates sprint file      │
  │                        │  when done ────────────>  │
  │                        │                           │
```

## Quick Start

```bash
# Initialize with defaults (30min dailies, 5 days/sprint)
sprint-agent init

# Or customize everything
sprint-agent init --name "My SaaS" --daily 45 --days 4 --agent claude

# See today's status
sprint-agent status

# Create a new sprint with a goal
sprint-agent sprint new --goal "Launch MVP"

# Add tickets to the backlog
sprint-agent backlog add "Fix auth redirect loop" P1 S
sprint-agent backlog add "Add E2E tests" P2 L --sprint S03

# Generate Friday retro
sprint-agent retro

# Save to git
sprint-agent sync
```

After `init`, your project gets a `.sprint/` directory:

```
.sprint/
├── AGENT.md              ← Instructions for the AI agent (auto-loaded by Claude Code, Cursor, etc.)
├── backlog.md            ← Prioritized product backlog
├── sprints/
│   ├── S01_2025-01-06.md ← Weekly sprint with daily breakdown
│   └── ...
├── retros/
│   ├── RETRO_S01.md      ← Friday retrospective
│   └── ...
├── sessions/
│   └── 2025-01-06.md     ← Session log (auto-updated by agent)
└── config.yaml           ← Sprint Agent settings
```

## Why AI Agents Need This

### The Context Problem

AI agents are **stateless by default**. Every new conversation starts from zero.

```
Without Sprint Agent:                With Sprint Agent:

"What should I work on?"          Reads .sprint/current-sprint.md
→ Reads 50 files (20 min)         → Knows in 30 seconds:
→ Asks you 5 questions              • Sprint S03, Day 2
→ Guesses priorities                 • Next ticket: P1-04
→ Might redo yesterday's work        • Context from yesterday
                                     • Known blockers
```

### The Token Cost — Real Numbers

*Measured on a real project (DataFrancePro, 5M company database, 70+ tickets):*

| What the agent reads | Without Sprint Agent | With Sprint Agent |
|---------------------|-------------------|----------------|
| CLAUDE.md / instructions | 6,200 tokens | 200 tokens (AGENT.md) |
| Session history (2-3 files) | 5,100 tokens | 0 (in sprint file) |
| State file (ETAT_ACTUEL) | 1,600 tokens | 0 (in sprint file) |
| Sprint file | — | 1,900 tokens |
| **Total context tokens** | **~12,300** | **~2,100** |
| **Reduction** | | **83%** |

**Time measured across 10 real sessions:**

| Metric | Without | With Sprint Agent | Improvement |
|--------|---------|----------------|-------------|
| Context loading | 8-15 min | 2 min | **4-7x faster** |
| Work time per 30min session | 15-22 min | 28 min | **+50%** |
| Repeated exploration | Every session | Never | Eliminated |
| "What was I working on?" | Ask + explore | Read sprint file | Instant |

> **Methodology**: Tokens estimated at ~4 bytes/token. Time measured from session start to first productive action (code edit or command). Data from 10 daily sessions on DataFrancePro (April 14-17, 2026). Without = sessions before agile structure. With = sessions after Sprint Agent setup.

### Agent Compatibility

Sprint Agent works with any AI coding agent that reads project files:

| Agent | How it reads Sprint Agent |
|-------|----------------------|
| **Claude Code** | Auto-reads `CLAUDE.md` → full context |
| **Cursor** | Reads `.cursorrules` + `.sprint/` |
| **GitHub Copilot** | Reads `.github/copilot-instructions.md` |
| **Aider** | Reads `.aider.conf.yml` conventions |
| **Windsurf** | Reads `.windsurfrules` |
| **Any agent** | Just tell it: "Read .sprint/current-sprint.md" |

## The Agile Model

Sprint Agent implements a lightweight agile workflow designed for **solo developers + AI agent** pairs:

```
┌─────────────────── WEEK ────────────────────┐
│                                              │
│  Mon     Tue     Wed     Thu     Fri         │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐         │
│  │ D │  │ D │  │ D │  │ D │  │ R │         │
│  │ A │  │ A │  │ A │  │ A │  │ E │         │
│  │ I │  │ I │  │ I │  │ I │  │ T │         │
│  │ L │  │ L │  │ L │  │ L │  │ R │         │
│  │ Y │  │ Y │  │ Y │  │ Y │  │ O │         │
│  │   │  │   │  │   │  │   │  │   │         │
│  │30m│  │30m│  │30m│  │30m│  │15m│         │
│  └───┘  └───┘  └───┘  └───┘  └───┘         │
│                                              │
│  Daily = check + 1 ticket + update           │
│  Retro = what worked, what didn't, next      │
│                                              │
│  Total: 2h30 of focused AI-assisted work     │
│  Result: 5-10 tickets done per sprint        │
└──────────────────────────────────────────────┘
```

### Backlog → Sprint → Daily → Retro

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ BACKLOG  │────>│  SPRINT  │────>│  DAILY   │────>│  RETRO   │
│          │     │          │     │          │     │          │
│ All work │     │ This week│     │ Today    │     │ Review   │
│ P0 → P4  │     │ 5 tickets│     │ 1 ticket │     │ Improve  │
│ Icebox   │     │ Mon-Fri  │     │ 30 min   │     │ Plan     │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                       │                │                │
                       v                v                v
                  sprint.md       sprint.md ✓      retro.md
                  (planned)       (updated)        (lessons)
```

## Configuration

```yaml
# .sprint/config.yaml
project:
  name: "My SaaS App"
  repo: "myorg/myapp"

sprint:
  duration: 7           # days (default: 7)
  daily_duration: 30    # minutes (default: 30)
  retro_day: friday     # day of week (default: friday)
  start_day: monday     # day of week (default: monday)

agent:
  type: auto            # auto-detect (claude, cursor, copilot, aider)
  instructions: true    # generate CLAUDE.md / .cursorrules / etc.

priorities:
  - P0: Critical (blockers, security)
  - P1: High (this sprint)
  - P2: Medium (next sprint)
  - P3: Low (this quarter)
  - P4: Nice-to-have (someday)

effort:
  - XS: "< 30 min"
  - S: "1 hour"
  - M: "2-4 hours"
  - L: "4-8 hours"
  - XL: "> 1 day"
```

## Real-World Example

This framework was battle-tested building [DataFrancePro](https://datafrancepro.fr) — a B2B SaaS with 5M+ companies, built by one developer + Claude Code in 6 weeks:

| Sprint | Tickets Done | Highlights |
|--------|-------------|------------|
| S01-S04 | ~30 | Infrastructure, ETL, 5M migration, security |
| S05 | 32 | Admin dashboard, scraping, 80 tests |
| **S06** | **10** | Stripe audit, MCP protocol, ARIA accessibility, CI fix |

**6 sprints, 70+ tickets, 1 developer, 30-minute daily sessions.**

## Commands & Parameters

### `sprint-agent init [options]`

Scaffolds `.sprint/` directory with all templates.

| Option | Default | Description |
|--------|---------|-------------|
| `--name <name>` | directory name | Project name |
| `--daily <minutes>` | `30` | Daily session duration |
| `--days <n>` | `5` | Working days per sprint |
| `--retro-day <day>` | `friday` | Retrospective day |
| `--agent <type>` | `auto` | Agent: `claude`, `cursor`, `copilot`, `aider`, `windsurf` |
| `--force` | — | Overwrite existing `.sprint/` |

```bash
# Solo dev, short sessions
sprint-agent init --daily 20 --days 3

# Team with Cursor, longer sprints
sprint-agent init --name "MyApp" --daily 60 --agent cursor

# Weekend warrior
sprint-agent init --daily 120 --days 2 --retro-day sunday
```

### `sprint-agent sprint new [options]`

Creates next weekly sprint from template.

| Option | Default | Description |
|--------|---------|-------------|
| `--goal <text>` | `TBD` | Sprint goal |
| `--daily <minutes>` | from config | Override daily duration |
| `--days <n>` | from config | Override working days |

```bash
sprint-agent sprint new --goal "Launch auth + payment flow"
```

### `sprint-agent backlog add <description> [options]`

Adds a prioritized ticket to the backlog.

| Option | Default | Description |
|--------|---------|-------------|
| `P0`-`P4` | `P2` | Priority level |
| `XS`/`S`/`M`/`L`/`XL` | `M` | Effort estimate |
| `--sprint <id>` | — | Assign to a sprint |

```bash
sprint-agent backlog add "Fix auth redirect loop" P1 S
sprint-agent backlog add "Add rate limiting" P2 M --sprint S03
sprint-agent backlog add "Security audit" P0 XL
```

### Other commands

| Command | Description |
|---------|-------------|
| `sprint-agent status` | Today's date, sprint, progress bar, remaining tickets |
| `sprint-agent backlog list` | Display full backlog |
| `sprint-agent retro` | Generate Friday retrospective template |
| `sprint-agent config` | Show current configuration |
| `sprint-agent sync` | Git commit + push `.sprint/` changes |

## What Gets Generated

### AGENT.md (for Claude Code)

```markdown
# Project — AI Agent Instructions

## Your workflow
1. Run `sprint-agent status` to see today's context
2. Read `.sprint/sprints/current.md` for this week's plan
3. Pick the next TODO ticket
4. Work for 25 minutes
5. Update the sprint file when done
6. Commit with ticket ID in message

## Rules
- 1 daily = 1 ticket (unless XS)
- Always verify deploys after push
- Document blockers in sprint file
- Never skip the Friday retro
```

### Sprint File

```markdown
# Sprint S03 — Jan 20-24, 2025

## Monday — DONE
- [x] P1-04: Fix auth redirect loop (commit abc123)

## Tuesday — TODAY
- [ ] P2-01: Add rate limiting to /api/search

## Wednesday
- [ ] P2-02: Mobile responsive dashboard

## Metrics
| Metric | Start | Current |
|--------|-------|---------|
| Tests | 45 | 52 |
| API routes | 23 | 25 |
```

## Philosophy

1. **Markdown over databases** — Everything in `.md` files. Readable by humans AND AI agents.
2. **Convention over configuration** — Opinionated defaults. Override only what you need.
3. **Agent-first** — Designed to be read by AI, not just humans.
4. **Git-native** — Sprint history is version-controlled. Diffs show progress.
5. **Zero dependencies at runtime** — Your sprint files work without Sprint Agent installed.

## Contributing

Sprint Agent is open source (MIT). Contributions welcome.

```bash
git clone https://github.com/2pidata/sprint-agent
cd sprint-agent
npm install
npm test
```

## License

MIT — [2PiData](https://2pidata.fr)

---

**Built with Sprint Agent by [Miloud Belarebia](https://github.com/databelarebia) — Founder of [2PiData](https://2pidata.fr)**

*Tested in production building DataFrancePro: 5M+ company database, 70+ tickets, 6 sprints, one developer + Claude Code.*
