# SprintKit

**Turn any AI agent into an agile developer.**

SprintKit gives AI coding agents (Claude Code, Cursor, Copilot, Aider) persistent memory and structured workflow — so they stop wasting tokens re-reading your codebase and start shipping like a teammate.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-coming_soon-orange.svg)]()

---

## The Problem

Every time you start a new session with an AI agent:

```
┌─────────────────────────────────────────────────────────┐
│                   WITHOUT SprintKit                      │
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
│                   WITH SprintKit                         │
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
 You                    SprintKit                   AI Agent
  │                        │                           │
  │  npx sprintkit init    │                           │
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
# Initialize SprintKit in your project
npx sprintkit init

# See today's status
npx sprintkit status

# Create a new sprint
npx sprintkit sprint new

# Add a ticket to the backlog
npx sprintkit backlog add "Fix auth redirect loop" --priority P1

# Generate Friday retro
npx sprintkit retro
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
└── config.yaml           ← SprintKit settings
```

## Why AI Agents Need This

### The Context Problem

AI agents are **stateless by default**. Every new conversation starts from zero.

```
Without SprintKit:                With SprintKit:

"What should I work on?"          Reads .sprint/current-sprint.md
→ Reads 50 files (20 min)         → Knows in 30 seconds:
→ Asks you 5 questions              • Sprint S03, Day 2
→ Guesses priorities                 • Next ticket: P1-04
→ Might redo yesterday's work        • Context from yesterday
                                     • Known blockers
```

### The Token Cost

| Metric | Without | With SprintKit | Savings |
|--------|---------|----------------|---------|
| Context loading | ~20 min / session | ~2 min / session | **90%** |
| Tokens per session | ~50K on context | ~5K on context | **90%** |
| Work time per 30min session | ~10 min | ~28 min | **2.8x** |
| Repeated work | Common | Never | **100%** |
| Knowledge loss between sessions | Total | Zero | **∞** |

### Agent Compatibility

SprintKit works with any AI coding agent that reads project files:

| Agent | How it reads SprintKit |
|-------|----------------------|
| **Claude Code** | Auto-reads `CLAUDE.md` → full context |
| **Cursor** | Reads `.cursorrules` + `.sprint/` |
| **GitHub Copilot** | Reads `.github/copilot-instructions.md` |
| **Aider** | Reads `.aider.conf.yml` conventions |
| **Windsurf** | Reads `.windsurfrules` |
| **Any agent** | Just tell it: "Read .sprint/current-sprint.md" |

## The Agile Model

SprintKit implements a lightweight agile workflow designed for **solo developers + AI agent** pairs:

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

## Commands

| Command | Description |
|---------|-------------|
| `sprintkit init` | Initialize SprintKit in current project |
| `sprintkit status` | Show today's status (day, sprint, progress, deploys) |
| `sprintkit sprint new` | Create a new sprint from backlog |
| `sprintkit sprint close` | Close current sprint, generate summary |
| `sprintkit backlog add` | Add a ticket to the backlog |
| `sprintkit backlog list` | List backlog by priority |
| `sprintkit retro` | Generate retrospective template for today |
| `sprintkit daily` | Start a daily session (timer + ticket) |
| `sprintkit sync` | Push .sprint/ changes to git |

## What Gets Generated

### AGENT.md (for Claude Code)

```markdown
# Project — AI Agent Instructions

## Your workflow
1. Run `sprintkit status` to see today's context
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
5. **Zero dependencies at runtime** — Your sprint files work without SprintKit installed.

## Contributing

SprintKit is open source (MIT). Contributions welcome.

```bash
git clone https://github.com/2pidata/sprintkit
cd sprintkit
npm install
npm test
```

## License

MIT — [2PiData](https://2pidata.fr)

---

**Built with SprintKit by [Miloud Belarebia](https://github.com/databelarebia) — Founder of [2PiData](https://2pidata.fr)**

*Tested in production building DataFrancePro: 5M+ company database, 70+ tickets, 6 sprints, one developer + Claude Code.*
