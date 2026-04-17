#!/usr/bin/env node

/**
 * SprintKit CLI — Turn any AI agent into an agile developer.
 *
 * Usage:
 *   npx sprintkit init          Initialize .sprint/ in current project
 *   npx sprintkit status        Show today's status
 *   npx sprintkit sprint new    Create a new sprint
 *   npx sprintkit sprint close  Close current sprint
 *   npx sprintkit backlog add   Add a ticket
 *   npx sprintkit backlog list  List backlog
 *   npx sprintkit retro         Generate retro template
 *   npx sprintkit daily         Start daily session
 *   npx sprintkit sync          Git add + commit + push .sprint/
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SPRINT_DIR = '.sprint'
const VERSION = '0.1.0'

// ── Colors ──
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

// ── Helpers ──
function today() {
  return new Date().toISOString().split('T')[0]
}

function dayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

function dayNum() {
  const d = new Date().getDay()
  return d === 0 ? 7 : d // 1=Mon, 7=Sun
}

function sprintNumber(startDate = '2025-01-06') {
  const now = new Date()
  const start = new Date(startDate)
  const diffDays = Math.floor((now - start) / 86400000)
  return Math.floor(diffDays / 7) + 1
}

function sprintId(num) {
  return `S${String(num).padStart(2, '0')}`
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readConfig() {
  const configPath = path.join(SPRINT_DIR, 'config.yaml')
  if (!fs.existsSync(configPath)) return {}
  const raw = fs.readFileSync(configPath, 'utf-8')
  // Simple YAML parser (key: value on each line)
  const config = {}
  for (const line of raw.split('\n')) {
    const match = line.match(/^\s*(\w+):\s*(.+)/)
    if (match) config[match[1]] = match[2].trim().replace(/^["']|["']$/g, '')
  }
  return config
}

function findCurrentSprint() {
  const sprintsDir = path.join(SPRINT_DIR, 'sprints')
  if (!fs.existsSync(sprintsDir)) return null
  const files = fs.readdirSync(sprintsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()
  return files[0] ? path.join(sprintsDir, files[0]) : null
}

function progressBar(done, total, len = 25) {
  if (total === 0) return '░'.repeat(len)
  const pct = Math.round((done / total) * 100)
  const filled = Math.round((pct / 100) * len)
  return `${c.green}${'█'.repeat(filled)}${c.reset}${'░'.repeat(len - filled)} ${pct}%`
}

// ── Commands ──

function cmdInit() {
  console.log(`\n${c.bold}SprintKit — Initializing...${c.reset}\n`)

  if (fs.existsSync(SPRINT_DIR)) {
    console.log(`${c.yellow}! .sprint/ already exists. Skipping init.${c.reset}`)
    return
  }

  // Create directories
  ensureDir(path.join(SPRINT_DIR, 'sprints'))
  ensureDir(path.join(SPRINT_DIR, 'retros'))
  ensureDir(path.join(SPRINT_DIR, 'sessions'))

  // Config
  const projectName = path.basename(process.cwd())
  fs.writeFileSync(path.join(SPRINT_DIR, 'config.yaml'), `# SprintKit configuration
project:
  name: "${projectName}"

sprint:
  duration: 7
  daily_duration: 30
  retro_day: friday
  start_day: monday

agent:
  type: auto

priorities:
  P0: "Critical (blockers, security)"
  P1: "High (this sprint)"
  P2: "Medium (next sprint)"
  P3: "Low (this quarter)"
  P4: "Nice-to-have"
`)

  // Backlog
  fs.writeFileSync(path.join(SPRINT_DIR, 'backlog.md'), `# Product Backlog

> Last updated: ${today()}
> Priorities: P0 (critical) → P4 (nice-to-have)

## Active

| ID | Priority | Description | Effort | Sprint |
|----|----------|-------------|--------|--------|
| T-001 | P1 | Example: Setup project infrastructure | M | S01 |

## Icebox

| ID | Description | Notes |
|----|-------------|-------|
`)

  // AGENT.md (for Claude Code / AI agents)
  fs.writeFileSync(path.join(SPRINT_DIR, 'AGENT.md'), `# AI Agent Instructions — SprintKit

> This file is auto-read by Claude Code, Cursor, and other AI agents.
> It gives you persistent context across sessions.

## Your Workflow (every session)

1. **Read this file** to understand the project context
2. **Read \`.sprint/sprints/\` latest file** to see the current sprint
3. **Pick the next TODO ticket** from today's plan
4. **Work for 25 minutes** on the ticket
5. **Update the sprint file** — mark ticket as done, add notes
6. **Commit** with ticket ID in the message

## Rules

- 1 daily = 1 ticket (unless XS effort)
- Always verify deploys after push
- Document blockers in the sprint file
- Never skip the Friday retro
- If blocked > 5 min, note it and move to next ticket
- Update backlog if you discover new work

## Quick Status

Run: \`npx sprintkit status\`

## Project Context

> Add your project-specific context below this line.
> What does this project do? What's the tech stack? What are the key files?

`)

  // Also create CLAUDE.md at project root if it doesn't exist
  if (!fs.existsSync('CLAUDE.md')) {
    fs.writeFileSync('CLAUDE.md', `# Project Instructions

> Auto-generated by SprintKit. Customize below.

## First thing to do

1. Read \`.sprint/AGENT.md\` for your workflow
2. Read the latest file in \`.sprint/sprints/\` for today's plan
3. Start working on the next TODO ticket

## SprintKit

This project uses [SprintKit](https://github.com/2pidata/sprintkit) for agile AI workflow.
Run \`npx sprintkit status\` to see today's context.
`)
    console.log(`${c.green}✓${c.reset} Created CLAUDE.md`)
  }

  // Create first sprint
  const sNum = 1
  const sId = sprintId(sNum)
  const sprintFile = path.join(SPRINT_DIR, 'sprints', `${sId}_${today()}.md`)
  fs.writeFileSync(sprintFile, `# Sprint ${sId} — Week of ${today()}

> Goal: Get started
> Capacity: 5 dailies x 30 min = 2h30

## Monday
- [ ] Setup project + first ticket

## Tuesday
- [ ] TBD

## Wednesday
- [ ] TBD

## Thursday
- [ ] TBD

## Friday
- [ ] RETRO ${sId}

## Tickets

| ID | Description | Effort | Day | Status |
|----|-------------|--------|-----|--------|
| T-001 | Setup project infrastructure | M | Mon | TODO |

## Notes

_Add context, blockers, and discoveries here._
`)

  console.log(`${c.green}✓${c.reset} Created .sprint/ directory`)
  console.log(`${c.green}✓${c.reset} Created config.yaml`)
  console.log(`${c.green}✓${c.reset} Created backlog.md`)
  console.log(`${c.green}✓${c.reset} Created AGENT.md`)
  console.log(`${c.green}✓${c.reset} Created sprint ${sId}`)
  console.log()
  console.log(`${c.bold}Next steps:${c.reset}`)
  console.log(`  1. Edit ${c.cyan}.sprint/AGENT.md${c.reset} — add your project context`)
  console.log(`  2. Edit ${c.cyan}.sprint/backlog.md${c.reset} — add your tickets`)
  console.log(`  3. Run ${c.cyan}npx sprintkit status${c.reset} to verify`)
  console.log(`  4. Start a session with your AI agent`)
  console.log()
}

function cmdStatus() {
  const day = dayNum()
  const dName = dayName()
  const sprintFile = findCurrentSprint()

  console.log()
  console.log(`${c.bold}╔══════════════════════════════════════════╗${c.reset}`)
  console.log(`${c.bold}║        SprintKit — Daily Status          ║${c.reset}`)
  console.log(`${c.bold}╠══════════════════════════════════════════╣${c.reset}`)
  console.log(`${c.bold}║${c.reset}  ${c.cyan}Date${c.reset}  : ${c.bold}${today()} (${dName})${c.reset}`)

  if (sprintFile) {
    const content = fs.readFileSync(sprintFile, 'utf-8')
    const sprintName = path.basename(sprintFile, '.md').split('_')[0]
    const done = (content.match(/\[x\]/gi) || []).length
    const todo = (content.match(/\[ \]/g) || []).length
    const total = done + todo

    console.log(`${c.bold}║${c.reset}  ${c.cyan}Sprint${c.reset}: ${c.bold}${sprintName}${c.reset}  (day ${Math.min(day, 5)}/5)`)
    console.log(`${c.bold}║${c.reset}  ${c.cyan}Progress${c.reset}: ${progressBar(done, total)}  (${done}/${total})`)
    console.log(`${c.bold}╚══════════════════════════════════════════╝${c.reset}`)

    // Day context
    if (day === 5) {
      console.log(`\n${c.yellow}${c.bold}  FRIDAY — Retrospective day!${c.reset}`)
      console.log(`  Run: ${c.cyan}npx sprintkit retro${c.reset}`)
    } else if (day >= 6) {
      console.log(`\n${c.dim}  Weekend — no sprint${c.reset}`)
    }

    // Remaining tickets
    const lines = content.split('\n')
    const todos = lines.filter(l => l.includes('[ ]'))
    if (todos.length > 0) {
      console.log(`\n${c.yellow}Remaining tickets:${c.reset}`)
      todos.slice(0, 5).forEach(t => {
        console.log(`  ${c.red}○${c.reset} ${t.replace(/^.*\[ \]\s*/, '')}`)
      })
    } else {
      console.log(`\n${c.green}  ✓ All tickets done! Create next sprint: npx sprintkit sprint new${c.reset}`)
    }
  } else {
    console.log(`${c.bold}╚══════════════════════════════════════════╝${c.reset}`)
    console.log(`\n${c.yellow}No sprint found. Run: npx sprintkit init${c.reset}`)
  }
  console.log()
}

function cmdSprintNew() {
  ensureDir(path.join(SPRINT_DIR, 'sprints'))

  // Find next sprint number
  const files = fs.readdirSync(path.join(SPRINT_DIR, 'sprints')).filter(f => f.endsWith('.md')).sort()
  let nextNum = 1
  if (files.length > 0) {
    const last = files[files.length - 1]
    const match = last.match(/S(\d+)/)
    if (match) nextNum = parseInt(match[1]) + 1
  }
  const sId = sprintId(nextNum)
  const filename = `${sId}_${today()}.md`

  fs.writeFileSync(path.join(SPRINT_DIR, 'sprints', filename), `# Sprint ${sId} — Week of ${today()}

> Goal: TBD
> Capacity: 5 dailies x 30 min = 2h30
> Retro: Friday

## Monday
- [ ]

## Tuesday
- [ ]

## Wednesday
- [ ]

## Thursday
- [ ]

## Friday
- [ ] RETRO ${sId}

## Tickets

| ID | Description | Effort | Day | Status |
|----|-------------|--------|-----|--------|

## Notes

`)

  console.log(`\n${c.green}✓${c.reset} Created sprint ${c.bold}${sId}${c.reset}: .sprint/sprints/${filename}`)
  console.log(`  Edit the file to plan your week.\n`)
}

function cmdRetro() {
  ensureDir(path.join(SPRINT_DIR, 'retros'))

  const sprintFile = findCurrentSprint()
  let sId = 'S??'
  let done = 0, todo = 0
  if (sprintFile) {
    sId = path.basename(sprintFile, '.md').split('_')[0]
    const content = fs.readFileSync(sprintFile, 'utf-8')
    done = (content.match(/\[x\]/gi) || []).length
    todo = (content.match(/\[ \]/g) || []).length
  }

  const filename = `RETRO_${sId}_${today()}.md`
  fs.writeFileSync(path.join(SPRINT_DIR, 'retros', filename), `# Retrospective ${sId} — ${today()} (${dayName()})

## 1. What went well

-

## 2. What didn't go well

-

## 3. Metrics

| Metric | Start | End | Delta |
|--------|-------|-----|-------|
| Tickets done | | ${done} | |
| Tickets remaining | | ${todo} | |
| Tests | | | |
| Deploys | | | |

## 4. Actions for next sprint

- [ ]
- [ ]
- [ ]

## 5. Score (1-5)

- Productivity: /5
- Quality: /5
- Enjoyment: /5
`)

  console.log(`\n${c.green}✓${c.reset} Created retro: .sprint/retros/${filename}`)
  console.log(`  Fill it in, then run ${c.cyan}npx sprintkit sync${c.reset} to save.\n`)
}

function cmdBacklogAdd() {
  const desc = process.argv.slice(4).join(' ')
  if (!desc) {
    console.log(`\nUsage: ${c.cyan}npx sprintkit backlog add "Description" --priority P1 --effort M${c.reset}\n`)
    return
  }

  const priority = process.argv.find(a => a.match(/^P[0-4]$/)) || 'P2'
  const effort = process.argv.find(a => ['XS', 'S', 'M', 'L', 'XL'].includes(a)) || 'M'

  const backlogPath = path.join(SPRINT_DIR, 'backlog.md')
  if (!fs.existsSync(backlogPath)) {
    console.log(`${c.red}No backlog found. Run: npx sprintkit init${c.reset}`)
    return
  }

  const content = fs.readFileSync(backlogPath, 'utf-8')
  // Find next ticket ID
  const ids = content.match(/T-(\d+)/g) || []
  const maxId = ids.length > 0 ? Math.max(...ids.map(id => parseInt(id.replace('T-', '')))) : 0
  const newId = `T-${String(maxId + 1).padStart(3, '0')}`

  const newLine = `| ${newId} | ${priority} | ${desc} | ${effort} | — |`

  // Insert after the last row in Active table
  const lines = content.split('\n')
  let insertIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('|') && lines[i].includes('|') && !lines[i].includes('ID') && !lines[i].includes('---')) {
      insertIdx = i
    }
    if (lines[i].startsWith('## Icebox')) break
  }

  if (insertIdx >= 0) {
    lines.splice(insertIdx + 1, 0, newLine)
  } else {
    // Append before Icebox
    const iceboxIdx = lines.findIndex(l => l.startsWith('## Icebox'))
    lines.splice(iceboxIdx >= 0 ? iceboxIdx : lines.length, 0, newLine)
  }

  fs.writeFileSync(backlogPath, lines.join('\n'))
  console.log(`\n${c.green}✓${c.reset} Added ${c.bold}${newId}${c.reset}: ${desc} [${priority}] [${effort}]\n`)
}

function cmdSync() {
  try {
    execSync(`git add ${SPRINT_DIR}/ CLAUDE.md 2>/dev/null`, { stdio: 'pipe' })
    execSync(`git commit -m "sprint: update sprint files [sprintkit]"`, { stdio: 'pipe' })
    console.log(`\n${c.green}✓${c.reset} Committed .sprint/ changes`)

    try {
      execSync('git push', { stdio: 'pipe' })
      console.log(`${c.green}✓${c.reset} Pushed to remote\n`)
    } catch {
      console.log(`${c.yellow}! Push failed (no remote or auth issue). Commit is local.\n${c.reset}`)
    }
  } catch {
    console.log(`\n${c.dim}No changes to commit.${c.reset}\n`)
  }
}

function cmdHelp() {
  console.log(`
${c.bold}SprintKit v${VERSION}${c.reset} — Turn any AI agent into an agile developer.

${c.bold}Usage:${c.reset}
  sprintkit init              Initialize .sprint/ in current project
  sprintkit status            Show today's status
  sprintkit sprint new        Create a new sprint
  sprintkit backlog add       Add a ticket to the backlog
  sprintkit backlog list      Show backlog
  sprintkit retro             Generate retrospective template
  sprintkit sync              Git commit + push .sprint/ changes

${c.bold}Examples:${c.reset}
  ${c.cyan}npx sprintkit init${c.reset}
  ${c.cyan}npx sprintkit status${c.reset}
  ${c.cyan}npx sprintkit backlog add "Fix auth bug" P1 S${c.reset}
  ${c.cyan}npx sprintkit sprint new${c.reset}

${c.bold}Docs:${c.reset} https://github.com/2pidata/sprintkit
`)
}

// ── Router ──
const [cmd, sub] = process.argv.slice(2)

switch (cmd) {
  case 'init': cmdInit(); break
  case 'status': cmdStatus(); break
  case 'sprint':
    if (sub === 'new') cmdSprintNew()
    else cmdHelp()
    break
  case 'backlog':
    if (sub === 'add') cmdBacklogAdd()
    else if (sub === 'list') {
      const bp = path.join(SPRINT_DIR, 'backlog.md')
      if (fs.existsSync(bp)) console.log(fs.readFileSync(bp, 'utf-8'))
      else console.log('No backlog. Run: npx sprintkit init')
    }
    else cmdHelp()
    break
  case 'retro': cmdRetro(); break
  case 'daily': cmdStatus(); break
  case 'sync': cmdSync(); break
  case 'help': case '--help': case '-h': cmdHelp(); break
  case 'version': case '--version': case '-v': console.log(VERSION); break
  default: cmdHelp()
}
