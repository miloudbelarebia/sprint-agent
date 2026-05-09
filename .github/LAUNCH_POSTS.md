# Sprint Agent — Launch Posts (v0.4.0)

Drafts ready to copy/paste. Tweak tone before posting.

---

## 1. Hacker News — "Show HN"

**Title** (under 80 chars, hooky):
```
Show HN: Sprint Agent – 83% less context tokens for AI coding agents
```

**URL:** `https://github.com/miloudbelarebia/sprint-agent`

**Comment (post immediately after submission):**
```
Hey HN — I built Sprint Agent because every time I started a new session with
Claude Code / Cursor / Copilot, the agent re-read 50 files just to figure out
what I was working on. Same 12k tokens wasted, every single session.

Sprint Agent is a tiny Python CLI (zero deps, single file) that drops a
.sprint/ folder in your repo with a backlog, current sprint, and an AGENT.md
the agent auto-reads. The agent picks up exactly where it left off — what's
done, what's next, what's blocked.

Real numbers from 6 months of building DataFrancePro (5M-row B2B SaaS) with
this workflow:
- ~12,300 tokens per session  →  ~2,100 tokens (83% reduction)
- 8-15 min context loading    →  2 min (4-7× faster)
- 15-22 min real work / 30min →  28 min real work / 30min

Works with Claude Code, Cursor, Copilot, Codex, Gemini, Aider, Windsurf —
auto-generates the config file each agent expects (CLAUDE.md, .cursorrules,
AGENTS.md, .windsurfrules, etc).

Markdown over databases. Git-native. Zero deps. MIT.

  pip install sprint-agent && sprint-agent init

Would love feedback on the agile model — I'm a solo dev and this is what
worked for me, but curious if anyone has tried something similar.
```

---

## 2. Twitter / X (thread)

**Tweet 1 (hook):**
```
Every AI coding session starts the same way: the agent re-reads 50 files
to figure out what I'm working on.

12,300 tokens. Every. Single. Time.

I built Sprint Agent to fix this. 83% less context. 4-7× faster session
starts. Open-source. 🧵👇
```

**Tweet 2:**
```
The trick: drop a .sprint/ folder in your repo with the current sprint,
backlog, and an AGENT.md the agent auto-reads on session start.

Now Claude Code / Cursor / Copilot / Codex / Gemini / Aider / Windsurf
all pick up exactly where they left off.
```

**Tweet 3:**
```
Real numbers from building DataFrancePro (5M company B2B SaaS, 70+ tickets,
6 sprints, solo dev + Claude Code):

  Without:  12,300 tokens · 8-15 min context loading · 15 min real work
  With:      2,100 tokens · 2 min context loading    · 28 min real work
```

**Tweet 4:**
```
Zero dependencies. Pure Python stdlib. Single file. MIT.

  pip install sprint-agent && sprint-agent init

GitHub: https://github.com/miloudbelarebia/sprint-agent

(0 stars right now — would mean a lot if you found it useful ⭐)
```

---

## 3. LinkedIn

```
I shipped Sprint Agent today.

The pain: every time I open Claude Code or Cursor on a project, the AI
spends 8-15 minutes re-reading my codebase before it can do anything
useful. ~12,000 tokens of "what is this project again?" — every session.

The fix: a tiny CLI that drops a .sprint/ folder in your repo. Inside,
your AI agent finds:
  • Current sprint with daily breakdown
  • Prioritized backlog
  • Project context written once, read forever
  • Friday retrospectives

Now the agent picks up exactly where it left off. No re-exploration.

Numbers from building DataFrancePro (5M-row B2B SaaS) with this workflow:
  → 83% less context tokens per session
  → 4-7× faster session starts
  → +50% real work time per 30-minute daily

It works with Claude Code, Cursor, Copilot, Codex, Gemini, Aider, Windsurf —
auto-generates the config file each one expects.

Zero dependencies. Single Python file. MIT-licensed.

  pip install sprint-agent

Would love your feedback if you build with AI agents:
https://github.com/miloudbelarebia/sprint-agent

#AI #DeveloperTools #Productivity #OpenSource #Agile
```

---

## 4. Reddit — r/ClaudeAI

**Title:**
```
I built a CLI that gives Claude Code persistent sprint context (83% less tokens per session)
```

**Body:**
```
Hey r/ClaudeAI — sharing something I've been using daily for 6 months.

**The problem**: Every Claude Code session starts with Claude re-reading
my codebase. Same 12k tokens wasted just to rebuild context.

**Sprint Agent** drops a `.sprint/` folder in your repo. Inside:
- `AGENT.md` — auto-loaded by Claude (project context written once)
- `sprints/S03_*.md` — current sprint with daily breakdown
- `backlog.md` — prioritized P0-P4 with effort estimates
- `retros/` — Friday retrospectives

Claude Code reads this in 2 minutes instead of 8-15. Picks up exactly
where it left off — what shipped yesterday, what's blocking, what's next.

**Numbers** (from building a real SaaS with this for 6 months):
- Context tokens: 12,300 → 2,100 (-83%)
- Session start: 8-15 min → 2 min
- Actual work in 30 min: 15 min → 28 min

Zero dependencies. Single Python file. MIT.

  pip install sprint-agent
  sprint-agent init

Github: https://github.com/miloudbelarebia/sprint-agent

Curious what other patterns people use to keep Claude Code context across
sessions. CLAUDE.md alone wasn't enough for me — I needed the agile loop.
```

Adapt for: r/cursor, r/AICodingTools, r/Python (more techie tone).

---

## 5. Dev.to / Hashnode (article-length)

**Title:**
```
Why I gave Claude Code an agile workflow (and 83% less context tokens)
```

**Outline:**
1. The repeated-context problem (with token receipts)
2. Why CLAUDE.md alone isn't enough for solo devs
3. The 30-minute daily as a forcing function for AI sessions
4. The .sprint/ structure
5. Multi-agent (Claude/Cursor/Codex) compatibility
6. 6 months of receipts: 70 tickets, 6 sprints, one dev
7. How to start in 2 minutes

CTA: GitHub link + pip install.

---

## Distribution checklist

- [ ] HN: post 8-10am PST Monday-Wednesday for max visibility
- [ ] Twitter/X: post thread, then RT with first reply being a screenshot
- [ ] LinkedIn: post during EU working hours (9-11am CET)
- [ ] r/ClaudeAI: weekend mornings work well there
- [ ] r/cursor: same
- [ ] r/Python: needs a more substantive technical angle, not pure marketing
- [ ] Dev.to article: cross-post to Hashnode + Medium
- [ ] Tag/mention in Anthropic Discord, Cursor Discord, Aider Discord
- [ ] Add to: awesome-claude-code, awesome-ai-coding lists (PR)

## Don't post all at once

Stagger by 24-48h to keep momentum across feeds. Leave time to engage
with comments — first comments shape the entire thread.
