#!/usr/bin/env node

/**
 * SprintKit CLI — Turn any AI agent into an agile developer.
 *
 * Usage:
 *   npx sprintkit init [options]     Initialize .sprint/ in current project
 *   npx sprintkit status             Show today's status
 *   npx sprintkit sprint new [opts]  Create a new sprint
 *   npx sprintkit sprint close       Close current sprint
 *   npx sprintkit backlog add        Add a ticket
 *   npx sprintkit backlog list       List backlog
 *   npx sprintkit retro              Generate retro template
 *   npx sprintkit config             Show/edit configuration
 *   npx sprintkit sync               Git add + commit + push .sprint/
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SPRINT_DIR = '.sprint'
const VERSION = '0.2.0'

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

// ── Argument parser ──
function parseArgs(argv) {
  const args = {}
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        args[key] = next
        i++
      } else {
        args[key] = true
      }
    } else if (a.match(/^P[0-4]$/)) {
      args.priority = a
    } else if (['XS', 'S', 'M', 'L', 'XL'].includes(a)) {
      args.effort = a
    } else {
      positional.push(a)
    }
  }
  return { args, positional }
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

function mondayOf(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

function sprintId(num) {
  return `S${String(num).padStart(2, '0')}`
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readConfig() {
  const configPath = path.join(SPRINT_DIR, 'config.yaml')
  if (!fs.existsSync(configPath)) return defaults()
  const raw = fs.readFileSync(configPath, 'utf-8')
  const config = {}
  let section = ''
  for (const line of raw.split('\n')) {
    const sectionMatch = line.match(/^(\w+):$/)
    if (sectionMatch) { section = sectionMatch[1]; continue }
    const kvMatch = line.match(/^\s+(\w+):\s*(.+)/)
    if (kvMatch) {
      const key = section ? `${section}.${kvMatch[1]}` : kvMatch[1]
      const rawVal = kvMatch[2].split('#')[0].trim()  // strip inline YAML comments
      config[key] = rawVal.replace(/^["']|["']$/g, '')
    }
  }
  return { ...defaults(), ...config }
}

function defaults() {
  return {
    'project.name': path.basename(process.cwd()),
    'sprint.duration': '7',
    'sprint.daily_duration': '30',
    'sprint.retro_day': 'friday',
    'sprint.start_day': 'monday',
    'sprint.days_per_sprint': '5',
    'agent.type': 'auto',
  }
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

const DAYS_LONG = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAYS_SHORT = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Commands ──

function cmdInit() {
  const { args } = parseArgs(process.argv.slice(3))

  // Configurable params
  const projectName = args.name || args.project || path.basename(process.cwd())
  const dailyMin = args.daily || args['daily-duration'] || '30'
  const sprintDays = args['sprint-days'] || args.days || '5'
  const retroDay = args['retro-day'] || args.retro || 'friday'
  const agentType = args.agent || 'auto'

  console.log(`\n${c.bold}SprintKit — Initializing...${c.reset}\n`)

  if (fs.existsSync(SPRINT_DIR)) {
    console.log(`${c.yellow}! .sprint/ already exists. Use --force to overwrite.${c.reset}`)
    if (!args.force) return
  }

  ensureDir(path.join(SPRINT_DIR, 'sprints'))
  ensureDir(path.join(SPRINT_DIR, 'retros'))
  ensureDir(path.join(SPRINT_DIR, 'sessions'))

  // Config
  const totalHours = (parseInt(sprintDays) * parseInt(dailyMin) / 60).toFixed(1)
  fs.writeFileSync(path.join(SPRINT_DIR, 'config.yaml'), `# SprintKit configuration
# Edit these values to customize your workflow
# Docs: https://github.com/2pidata/sprintkit

project:
  name: "${projectName}"

sprint:
  duration: 7                  # days in a sprint (calendar days)
  days_per_sprint: ${sprintDays}          # working days per sprint
  daily_duration: ${dailyMin}            # minutes per daily session
  retro_day: ${retroDay}           # day of the week for retrospective
  start_day: monday            # first working day of the sprint

agent:
  type: ${agentType}                 # auto | claude | cursor | copilot | aider | windsurf

# Priority definitions (customize labels to your needs)
priorities:
  P0: "Critical — blockers, security, data loss"
  P1: "High — must ship this sprint"
  P2: "Medium — next sprint"
  P3: "Low — this quarter"
  P4: "Nice-to-have — someday/maybe"

# Effort scale (T-shirt sizing)
effort:
  XS: "< 30 min"
  S: "~1 hour"
  M: "2-4 hours (1 daily)"
  L: "4-8 hours (2-3 dailies)"
  XL: "> 1 day (break it down)"
`)

  // Backlog
  fs.writeFileSync(path.join(SPRINT_DIR, 'backlog.md'), `# Product Backlog

> Last updated: ${today()}
> Priorities: P0 (critical) → P4 (nice-to-have)
> Effort: XS (<30min) S (~1h) M (2-4h) L (4-8h) XL (>1d)

## Active

| ID | Priority | Description | Effort | Sprint |
|----|----------|-------------|--------|--------|
| T-001 | P1 | Example: Setup project infrastructure | M | S01 |

## Done

| ID | Description | Sprint | Date |
|----|-------------|--------|------|

## Icebox

| ID | Description | Notes |
|----|-------------|-------|
`)

  // AGENT.md
  fs.writeFileSync(path.join(SPRINT_DIR, 'AGENT.md'), `# AI Agent Instructions — SprintKit

> This file is auto-read by Claude Code, Cursor, and other AI agents.
> It gives you persistent context across sessions.

## Your Workflow (every session)

1. **Read this file** to understand the project context
2. **Read \`.sprint/sprints/\` latest file** to see the current sprint
3. **Pick the next TODO ticket** from today's plan
4. **Work for ${dailyMin} minutes** on the ticket
5. **Update the sprint file** — mark ticket as done, add notes
6. **Commit** with ticket ID in the message (e.g. "T-003: fix auth redirect")

## Rules

- 1 daily = 1 ticket (unless XS effort)
- Always verify deploys after push (\`gh run list --limit 1\`)
- Document blockers in the sprint file
- Friday = retrospective day (run \`npx sprintkit retro\`)
- If blocked > 5 min, note it and move to next ticket
- Update backlog if you discover new work

## Sprint Settings

- Daily session: ${dailyMin} min
- Working days per sprint: ${sprintDays}
- Total sprint capacity: ${totalHours}h
- Retrospective: ${retroDay}

## Quick Status

Run: \`npx sprintkit status\`

## Project Context

> ADD YOUR PROJECT-SPECIFIC CONTEXT BELOW THIS LINE.
> The more context you give here, the less the agent needs to explore.
>
> Suggested sections:
> - What does this project do? (2-3 sentences)
> - Tech stack (languages, frameworks, DB, infra)
> - Key files and directories
> - How to run / test / deploy
> - Current priorities or constraints
> - Known issues or technical debt

`)

  // CLAUDE.md at root
  if (!fs.existsSync('CLAUDE.md') || args.force) {
    fs.writeFileSync('CLAUDE.md', `# Project Instructions

> Auto-generated by SprintKit. Customize below.

## First thing to do

1. Read \`.sprint/AGENT.md\` for your workflow and project context
2. Read the latest file in \`.sprint/sprints/\` for today's plan
3. Start working on the next TODO ticket

## SprintKit

This project uses [SprintKit](https://github.com/2pidata/sprintkit) for agile AI workflow.
Run \`npx sprintkit status\` to see today's context.
`)
    console.log(`${c.green}✓${c.reset} Created CLAUDE.md`)
  }

  // .cursorrules (for Cursor)
  if (agentType === 'auto' || agentType === 'cursor') {
    if (!fs.existsSync('.cursorrules') || args.force) {
      fs.writeFileSync('.cursorrules', `Read .sprint/AGENT.md for workflow instructions and project context.\nRead the latest file in .sprint/sprints/ for today's plan.\n`)
      console.log(`${c.green}✓${c.reset} Created .cursorrules`)
    }
  }

  // First sprint
  const sId = sprintId(1)
  const monday = mondayOf(today())
  const sprintFile = path.join(SPRINT_DIR, 'sprints', `${sId}_${monday}.md`)
  const dayHeaders = Array.from({ length: parseInt(sprintDays) }, (_, i) => {
    const dayLabel = DAYS_LONG[i + 1] || `Day ${i + 1}`
    return `## ${dayLabel}\n- [ ] \n`
  }).join('\n')

  fs.writeFileSync(sprintFile, `# Sprint ${sId} — Week of ${monday}

> Goal: Get started
> Capacity: ${sprintDays} dailies x ${dailyMin} min = ${totalHours}h
> Retro: ${retroDay}

${dayHeaders}
## Tickets

| ID | Description | Effort | Day | Status |
|----|-------------|--------|-----|--------|
| T-001 | Setup project infrastructure | M | ${DAYS_SHORT[1]} | TODO |

## Metrics

| Metric | Start | End | Delta |
|--------|-------|-----|-------|
| Tickets done | 0 | | |
| Tests | | | |
| Deploys | | | |

## Notes

_Add context, blockers, and discoveries here._
`)

  console.log(`${c.green}✓${c.reset} Created .sprint/ directory`)
  console.log(`${c.green}✓${c.reset} Created config.yaml (${dailyMin}min dailies, ${sprintDays} days/sprint)`)
  console.log(`${c.green}✓${c.reset} Created backlog.md`)
  console.log(`${c.green}✓${c.reset} Created AGENT.md`)
  console.log(`${c.green}✓${c.reset} Created sprint ${sId}`)
  console.log()
  console.log(`${c.bold}Next steps:${c.reset}`)
  console.log(`  1. Edit ${c.cyan}.sprint/AGENT.md${c.reset} — add your project context (tech stack, key files)`)
  console.log(`  2. Edit ${c.cyan}.sprint/backlog.md${c.reset} — add your tickets`)
  console.log(`  3. Run ${c.cyan}npx sprintkit status${c.reset} to verify`)
  console.log(`  4. Start a session with your AI agent — it will auto-read CLAUDE.md`)
  console.log()
}

function cmdStatus() {
  const config = readConfig()
  const day = dayNum()
  const dName = dayName()
  const sprintFile = findCurrentSprint()
  const dailyMin = config['sprint.daily_duration'] || '30'

  console.log()
  console.log(`${c.bold}╔══════════════════════════════════════════════╗${c.reset}`)
  console.log(`${c.bold}║          SprintKit — Daily Status             ║${c.reset}`)
  console.log(`${c.bold}╠══════════════════════════════════════════════╣${c.reset}`)
  console.log(`${c.bold}║${c.reset}  ${c.cyan}Date${c.reset}    : ${c.bold}${today()} (${dName})${c.reset}`)

  if (sprintFile) {
    const content = fs.readFileSync(sprintFile, 'utf-8')
    const sprintName = path.basename(sprintFile, '.md').split('_')[0]
    const done = (content.match(/\[x\]/gi) || []).length
    const todo = (content.match(/\[ \]/g) || []).length
    const total = done + todo

    console.log(`${c.bold}║${c.reset}  ${c.cyan}Sprint${c.reset}  : ${c.bold}${sprintName}${c.reset}  (day ${Math.min(day, 5)}/5)`)
    console.log(`${c.bold}║${c.reset}  ${c.cyan}Progress${c.reset}: ${progressBar(done, total)}  (${done}/${total})`)
    console.log(`${c.bold}║${c.reset}  ${c.cyan}Daily${c.reset}   : ${dailyMin} min session`)
    console.log(`${c.bold}╚══════════════════════════════════════════════╝${c.reset}`)

    // Day context
    const retroDay = (config['sprint.retro_day'] || 'friday').toLowerCase()
    const isRetroDay = dName.toLowerCase() === retroDay
    if (isRetroDay) {
      console.log(`\n${c.yellow}${c.bold}  ★ ${dName.toUpperCase()} — Retrospective day!${c.reset}`)
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
      if (todos.length > 5) {
        console.log(`  ${c.dim}  ... and ${todos.length - 5} more${c.reset}`)
      }
    } else {
      console.log(`\n${c.green}  ✓ All tickets done! Run: npx sprintkit sprint new${c.reset}`)
    }
  } else {
    console.log(`${c.bold}╚══════════════════════════════════════════════╝${c.reset}`)
    console.log(`\n${c.yellow}No sprint found. Run: npx sprintkit init${c.reset}`)
  }
  console.log()
}

function cmdSprintNew() {
  const { args } = parseArgs(process.argv.slice(4))
  const config = readConfig()

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
  const monday = mondayOf(today())
  const filename = `${sId}_${monday}.md`

  // Params from args or config
  const goal = args.goal || 'TBD'
  const dailyMin = args.daily || config['sprint.daily_duration'] || '30'
  const sprintDays = args.days || config['sprint.days_per_sprint'] || '5'
  const retroDay = args['retro-day'] || config['sprint.retro_day'] || 'friday'
  const totalHours = (parseInt(sprintDays) * parseInt(dailyMin) / 60).toFixed(1)

  const dayHeaders = Array.from({ length: parseInt(sprintDays) }, (_, i) => {
    const dayLabel = DAYS_LONG[i + 1] || `Day ${i + 1}`
    return `## ${dayLabel}\n- [ ] \n`
  }).join('\n')

  // Pull TODO tickets from backlog for this sprint
  let backlogTickets = ''
  const backlogPath = path.join(SPRINT_DIR, 'backlog.md')
  if (fs.existsSync(backlogPath)) {
    const bl = fs.readFileSync(backlogPath, 'utf-8')
    const rows = bl.split('\n').filter(l => l.startsWith('|') && l.includes('TODO'))
    if (rows.length > 0) {
      backlogTickets = `\n${c.dim}  Backlog has ${rows.length} TODO tickets. Pull them into the sprint above.${c.reset}`
    }
  }

  fs.writeFileSync(path.join(SPRINT_DIR, 'sprints', filename), `# Sprint ${sId} — Week of ${monday}

> Goal: ${goal}
> Capacity: ${sprintDays} dailies x ${dailyMin} min = ${totalHours}h
> Retro: ${retroDay}

${dayHeaders}
## Tickets

| ID | Description | Effort | Day | Status |
|----|-------------|--------|-----|--------|

## Metrics

| Metric | Start | End | Delta |
|--------|-------|-----|-------|
| Tickets done | 0 | | |
| Tests | | | |
| Deploys | | | |

## Notes

`)

  console.log(`\n${c.green}✓${c.reset} Created sprint ${c.bold}${sId}${c.reset}: .sprint/sprints/${filename}`)
  console.log(`  Goal: ${goal}`)
  console.log(`  Capacity: ${sprintDays} days x ${dailyMin}min = ${totalHours}h`)
  if (backlogTickets) console.log(backlogTickets)
  console.log()
}

function cmdRetro() {
  ensureDir(path.join(SPRINT_DIR, 'retros'))

  const sprintFile = findCurrentSprint()
  let sId = 'S??', done = 0, todo = 0
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
  console.log(`  Sprint ${sId}: ${done} done, ${todo} remaining`)
  console.log(`  Fill it in, then run ${c.cyan}npx sprintkit sync${c.reset} to save.\n`)
}

function cmdBacklogAdd() {
  const { args, positional } = parseArgs(process.argv.slice(4))
  const desc = positional.join(' ')
  if (!desc) {
    console.log(`
${c.bold}Usage:${c.reset} sprintkit backlog add <description> [options]

${c.bold}Options:${c.reset}
  P0-P4          Priority (default: P2)
  XS/S/M/L/XL   Effort (default: M)
  --sprint S03   Assign to sprint

${c.bold}Examples:${c.reset}
  ${c.cyan}sprintkit backlog add "Fix auth redirect loop" P1 S${c.reset}
  ${c.cyan}sprintkit backlog add "Add Playwright E2E tests" P2 L --sprint S07${c.reset}
  ${c.cyan}sprintkit backlog add "Security audit" P0 XL${c.reset}
`)
    return
  }

  const priority = args.priority || 'P2'
  const effort = args.effort || 'M'
  const sprint = args.sprint || '—'

  const backlogPath = path.join(SPRINT_DIR, 'backlog.md')
  if (!fs.existsSync(backlogPath)) {
    console.log(`${c.red}No backlog found. Run: npx sprintkit init${c.reset}`)
    return
  }

  const content = fs.readFileSync(backlogPath, 'utf-8')
  const ids = content.match(/T-(\d+)/g) || []
  const maxId = ids.length > 0 ? Math.max(...ids.map(id => parseInt(id.replace('T-', '')))) : 0
  const newId = `T-${String(maxId + 1).padStart(3, '0')}`

  const newLine = `| ${newId} | ${priority} | ${desc} | ${effort} | ${sprint} |`

  const lines = content.split('\n')
  let insertIdx = -1
  let inActive = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## Active')) inActive = true
    if (lines[i].startsWith('## Done') || lines[i].startsWith('## Icebox')) inActive = false
    if (inActive && lines[i].startsWith('|') && !lines[i].includes('ID') && !lines[i].includes('---')) {
      insertIdx = i
    }
  }

  if (insertIdx >= 0) {
    lines.splice(insertIdx + 1, 0, newLine)
  } else {
    const doneIdx = lines.findIndex(l => l.startsWith('## Done'))
    lines.splice(doneIdx >= 0 ? doneIdx : lines.length, 0, newLine)
  }

  fs.writeFileSync(backlogPath, lines.join('\n'))
  console.log(`\n${c.green}✓${c.reset} Added ${c.bold}${newId}${c.reset}: ${desc}`)
  console.log(`  Priority: ${priority}  Effort: ${effort}  Sprint: ${sprint}\n`)
}

function cmdConfig() {
  const config = readConfig()
  const configPath = path.join(SPRINT_DIR, 'config.yaml')

  if (!fs.existsSync(configPath)) {
    console.log(`${c.yellow}No config found. Run: npx sprintkit init${c.reset}`)
    return
  }

  console.log(`\n${c.bold}SprintKit Configuration${c.reset}`)
  console.log(`${c.dim}File: ${configPath}${c.reset}\n`)

  const groups = {}
  for (const [key, val] of Object.entries(config)) {
    const [group, name] = key.includes('.') ? key.split('.') : ['other', key]
    if (!groups[group]) groups[group] = []
    groups[group].push({ name, val })
  }
  for (const [group, items] of Object.entries(groups)) {
    console.log(`${c.cyan}${group}:${c.reset}`)
    for (const { name, val } of items) {
      console.log(`  ${name}: ${c.bold}${val}${c.reset}`)
    }
  }

  console.log(`\n${c.dim}Edit ${configPath} to change settings.${c.reset}\n`)
}

function cmdSync() {
  try {
    execSync(`git add ${SPRINT_DIR}/ CLAUDE.md .cursorrules 2>/dev/null`, { stdio: 'pipe' })
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

${c.bold}Commands:${c.reset}
  ${c.cyan}init${c.reset} [options]           Initialize .sprint/ in current project
  ${c.cyan}status${c.reset}                   Show today's status (day, sprint, progress)
  ${c.cyan}sprint new${c.reset} [options]      Create a new weekly sprint
  ${c.cyan}backlog add${c.reset} <desc> [opts] Add a ticket to the backlog
  ${c.cyan}backlog list${c.reset}             Show the full backlog
  ${c.cyan}retro${c.reset}                    Generate Friday retrospective
  ${c.cyan}config${c.reset}                   Show current configuration
  ${c.cyan}sync${c.reset}                     Git commit + push .sprint/ changes

${c.bold}Init options:${c.reset}
  --name <name>           Project name (default: directory name)
  --daily <minutes>       Daily session duration (default: 30)
  --days <n>              Working days per sprint (default: 5)
  --retro-day <day>       Retro day of week (default: friday)
  --agent <type>          Agent type: auto|claude|cursor|copilot|aider
  --force                 Overwrite existing .sprint/

${c.bold}Sprint new options:${c.reset}
  --goal <text>           Sprint goal
  --daily <minutes>       Override daily duration
  --days <n>              Override working days

${c.bold}Backlog add options:${c.reset}
  P0-P4                   Priority (default: P2)
  XS/S/M/L/XL             Effort (default: M)
  --sprint <id>           Assign to sprint (e.g. S03)

${c.bold}Examples:${c.reset}
  ${c.cyan}npx sprintkit init --daily 45 --days 4${c.reset}
  ${c.cyan}npx sprintkit init --name "My SaaS" --agent claude${c.reset}
  ${c.cyan}npx sprintkit sprint new --goal "Launch MVP"${c.reset}
  ${c.cyan}npx sprintkit backlog add "Fix auth bug" P1 S${c.reset}
  ${c.cyan}npx sprintkit backlog add "E2E tests" P2 L --sprint S03${c.reset}

${c.bold}Docs:${c.reset} https://github.com/2pidata/sprintkit
`)
}

// ── Router ──
const [cmd, sub] = process.argv.slice(2)

switch (cmd) {
  case 'init': cmdInit(); break
  case 'status': case 'daily': cmdStatus(); break
  case 'sprint':
    if (sub === 'new') cmdSprintNew()
    else if (sub === 'close') { console.log(`${c.yellow}TODO: sprint close${c.reset}`) }
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
  case 'config': cmdConfig(); break
  case 'sync': cmdSync(); break
  case 'help': case '--help': case '-h': cmdHelp(); break
  case 'version': case '--version': case '-v': console.log(VERSION); break
  default: cmdHelp()
}
