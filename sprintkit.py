#!/usr/bin/env python3
"""
SprintKit — Turn any AI agent into an agile developer.

Works two ways:
  1. Standalone:  python sprintkit.py init
  2. Via pip:     pip install sprintkit && sprintkit init

Zero dependencies. Pure Python stdlib.

https://github.com/2pidata/sprintkit
"""

import argparse
import os
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

__version__ = "0.3.0"

SPRINT_DIR = ".sprint"

# ── Colors (auto-disabled if not a terminal) ──
if sys.stdout.isatty():
    BOLD = "\033[1m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    CYAN = "\033[36m"
    DIM = "\033[2m"
    RESET = "\033[0m"
else:
    BOLD = RED = GREEN = YELLOW = BLUE = CYAN = DIM = RESET = ""

DAYS_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


# ══════════════════════════════════════════════════════════════
# Helpers
# ══════════════════════════════════════════════════════════════

def today():
    return datetime.now().strftime("%Y-%m-%d")


def day_name():
    return datetime.now().strftime("%A")


def day_num():
    """1=Monday, 7=Sunday (ISO weekday)."""
    return datetime.now().isoweekday()


def monday_of(date_str):
    d = datetime.strptime(date_str, "%Y-%m-%d")
    monday = d - timedelta(days=d.weekday())
    return monday.strftime("%Y-%m-%d")


def sprint_id(num):
    return f"S{num:02d}"


def ensure_dir(p):
    Path(p).mkdir(parents=True, exist_ok=True)


def progress_bar(done, total, length=25):
    if total == 0:
        return "░" * length
    pct = round(done / total * 100)
    filled = round(pct / 100 * length)
    return f"{GREEN}{'█' * filled}{RESET}{'░' * (length - filled)} {pct}%"


def read_config():
    config_path = os.path.join(SPRINT_DIR, "config.yaml")
    defaults = {
        "project.name": os.path.basename(os.getcwd()),
        "sprint.duration": "7",
        "sprint.days_per_sprint": "5",
        "sprint.daily_duration": "30",
        "sprint.retro_day": "friday",
        "sprint.start_day": "monday",
        "agent.type": "auto",
    }
    if not os.path.exists(config_path):
        return defaults
    section = ""
    config = dict(defaults)
    for line in open(config_path):
        line = line.rstrip()
        sec = line.strip()
        if sec and not sec.startswith("#") and sec.endswith(":") and not sec.startswith(" "):
            section = sec[:-1]
            continue
        parts = line.split(":", 1)
        if len(parts) == 2 and line.startswith("  "):
            key = parts[0].strip()
            val = parts[1].split("#")[0].strip().strip("\"'")
            full_key = f"{section}.{key}" if section else key
            config[full_key] = val
    return config


def find_current_sprint():
    sprints_dir = os.path.join(SPRINT_DIR, "sprints")
    if not os.path.isdir(sprints_dir):
        return None
    files = sorted([f for f in os.listdir(sprints_dir) if f.endswith(".md")], reverse=True)
    return os.path.join(sprints_dir, files[0]) if files else None


def count_checkboxes(content):
    import re
    done = len(re.findall(r"\[x\]", content, re.IGNORECASE))
    todo = len(re.findall(r"\[ \]", content))
    return done, todo


# ══════════════════════════════════════════════════════════════
# Commands
# ══════════════════════════════════════════════════════════════

def cmd_init(args):
    print(f"\n{BOLD}SprintKit — Initializing...{RESET}\n")

    if os.path.exists(SPRINT_DIR) and not args.force:
        print(f"{YELLOW}! .sprint/ already exists. Use --force to overwrite.{RESET}")
        return

    project_name = args.name or os.path.basename(os.getcwd())
    daily = str(args.daily)
    days = str(args.days)
    retro_day = args.retro_day
    agent = args.agent
    total_hours = f"{int(days) * int(daily) / 60:.1f}"

    # Directories
    for sub in ["sprints", "retros", "sessions"]:
        ensure_dir(os.path.join(SPRINT_DIR, sub))

    # config.yaml
    with open(os.path.join(SPRINT_DIR, "config.yaml"), "w") as f:
        f.write(f"""# SprintKit configuration
# Docs: https://github.com/2pidata/sprintkit

project:
  name: "{project_name}"

sprint:
  duration: 7
  days_per_sprint: {days}
  daily_duration: {daily}
  retro_day: {retro_day}
  start_day: monday

agent:
  type: {agent}

priorities:
  P0: "Critical — blockers, security, data loss"
  P1: "High — must ship this sprint"
  P2: "Medium — next sprint"
  P3: "Low — this quarter"
  P4: "Nice-to-have — someday/maybe"

effort:
  XS: "< 30 min"
  S: "~1 hour"
  M: "2-4 hours (1 daily)"
  L: "4-8 hours (2-3 dailies)"
  XL: "> 1 day (break it down)"
""")

    # backlog.md
    with open(os.path.join(SPRINT_DIR, "backlog.md"), "w") as f:
        f.write(f"""# Product Backlog

> Last updated: {today()}
> Priorities: P0 (critical) → P4 (nice-to-have)
> Effort: XS (<30min) S (~1h) M (2-4h) L (4-8h) XL (>1d)

## Active

| ID | Priority | Description | Effort | Sprint |
|----|----------|-------------|--------|--------|

## Done

| ID | Description | Sprint | Date |
|----|-------------|--------|------|

## Icebox

| ID | Description | Notes |
|----|-------------|-------|
""")

    # AGENT.md
    with open(os.path.join(SPRINT_DIR, "AGENT.md"), "w") as f:
        f.write(f"""# AI Agent Instructions — SprintKit

> This file is auto-read by Claude Code, Cursor, and other AI agents.
> It gives you persistent context across sessions.

## Your Workflow (every session)

1. **Read this file** to understand the project context
2. **Read `.sprint/sprints/` latest file** to see the current sprint
3. **Pick the next TODO ticket** from today's plan
4. **Work for {daily} minutes** on the ticket
5. **Update the sprint file** — mark ticket as done, add notes
6. **Commit** with ticket ID in the message (e.g. "T-003: fix auth redirect")

## Rules

- 1 daily = 1 ticket (unless XS effort)
- Always verify deploys after push
- Document blockers in the sprint file
- Friday = retrospective day (run `sprintkit retro`)
- If blocked > 5 min, note it and move to next ticket
- Update backlog if you discover new work

## Sprint Settings

- Daily session: {daily} min
- Working days per sprint: {days}
- Total sprint capacity: {total_hours}h
- Retrospective: {retro_day}

## Project Context

> ADD YOUR PROJECT-SPECIFIC CONTEXT BELOW THIS LINE.
> The more context you give here, the less the agent needs to explore.
>
> Suggested:
> - What does this project do? (2-3 sentences)
> - Tech stack
> - Key files and directories
> - How to run / test / deploy
> - Current priorities

""")

    # CLAUDE.md (root)
    if not os.path.exists("CLAUDE.md") or args.force:
        with open("CLAUDE.md", "w") as f:
            f.write("""# Project Instructions

> Auto-generated by SprintKit. Customize below.

## First thing to do

1. Read `.sprint/AGENT.md` for your workflow and project context
2. Read the latest file in `.sprint/sprints/` for today's plan
3. Start working on the next TODO ticket

## SprintKit

This project uses [SprintKit](https://github.com/2pidata/sprintkit) for agile AI workflow.
Run `sprintkit status` to see today's context.
""")
        print(f"{GREEN}✓{RESET} Created CLAUDE.md")

    # .cursorrules
    if agent in ("auto", "cursor"):
        if not os.path.exists(".cursorrules") or args.force:
            with open(".cursorrules", "w") as f:
                f.write("Read .sprint/AGENT.md for workflow instructions.\nRead the latest file in .sprint/sprints/ for today's plan.\n")
            print(f"{GREEN}✓{RESET} Created .cursorrules")

    # First sprint
    sid = sprint_id(1)
    monday = monday_of(today())
    sprint_file = os.path.join(SPRINT_DIR, "sprints", f"{sid}_{monday}.md")
    day_headers = "\n".join(
        f"## {DAYS_LONG[i]}\n- [ ] \n"
        for i in range(min(int(days), 5))
    )
    with open(sprint_file, "w") as f:
        f.write(f"""# Sprint {sid} — Week of {monday}

> Goal: Get started
> Capacity: {days} dailies x {daily} min = {total_hours}h
> Retro: {retro_day}

{day_headers}
## Tickets

| ID | Description | Effort | Day | Status |
|----|-------------|--------|-----|--------|

## Metrics

| Metric | Start | End | Delta |
|--------|-------|-----|-------|
| Tickets done | 0 | | |
| Tests | | | |

## Notes

_Add context, blockers, and discoveries here._
""")

    print(f"{GREEN}✓{RESET} Created .sprint/ directory")
    print(f"{GREEN}✓{RESET} Created config.yaml ({daily}min dailies, {days} days/sprint)")
    print(f"{GREEN}✓{RESET} Created backlog.md")
    print(f"{GREEN}✓{RESET} Created AGENT.md")
    print(f"{GREEN}✓{RESET} Created sprint {sid}")
    print()
    print(f"{BOLD}Next steps:{RESET}")
    print(f"  1. Edit {CYAN}.sprint/AGENT.md{RESET} — add your project context")
    print(f"  2. Edit {CYAN}.sprint/backlog.md{RESET} — add your tickets")
    print(f"  3. Run {CYAN}sprintkit status{RESET} to verify")
    print(f"  4. Start a session with your AI agent")
    print()


def cmd_status(args):
    config = read_config()
    dn = day_num()
    dname = day_name()
    sprint_file = find_current_sprint()
    daily_min = config.get("sprint.daily_duration", "30")

    print()
    print(f"{BOLD}╔══════════════════════════════════════════════╗{RESET}")
    print(f"{BOLD}║          SprintKit — Daily Status             ║{RESET}")
    print(f"{BOLD}╠══════════════════════════════════════════════╣{RESET}")
    print(f"{BOLD}║{RESET}  {CYAN}Date{RESET}    : {BOLD}{today()} ({dname}){RESET}")

    if sprint_file:
        content = open(sprint_file).read()
        sprint_name = os.path.basename(sprint_file).split("_")[0]
        done, todo = count_checkboxes(content)
        total = done + todo

        print(f"{BOLD}║{RESET}  {CYAN}Sprint{RESET}  : {BOLD}{sprint_name}{RESET}  (day {min(dn, 5)}/5)")
        print(f"{BOLD}║{RESET}  {CYAN}Progress{RESET}: {progress_bar(done, total)}  ({done}/{total})")
        print(f"{BOLD}║{RESET}  {CYAN}Daily{RESET}   : {daily_min} min session")
        print(f"{BOLD}╚══════════════════════════════════════════════╝{RESET}")

        retro_day = config.get("sprint.retro_day", "friday").lower()
        if dname.lower() == retro_day:
            print(f"\n{YELLOW}{BOLD}  ★ {dname.upper()} — Retrospective day!{RESET}")
            print(f"  Run: {CYAN}sprintkit retro{RESET}")
        elif dn >= 6:
            print(f"\n{DIM}  Weekend — no sprint{RESET}")

        lines = content.split("\n")
        todos = [l for l in lines if "[ ]" in l]
        if todos:
            print(f"\n{YELLOW}Remaining tickets:{RESET}")
            for t in todos[:5]:
                label = t.split("[ ]", 1)[-1].strip().lstrip("- ")
                if label:
                    print(f"  {RED}○{RESET} {label}")
            if len(todos) > 5:
                print(f"  {DIM}  ... and {len(todos) - 5} more{RESET}")
        else:
            print(f"\n{GREEN}  ✓ All tickets done! Run: sprintkit sprint new{RESET}")
    else:
        print(f"{BOLD}╚══════════════════════════════════════════════╝{RESET}")
        print(f"\n{YELLOW}No sprint found. Run: sprintkit init{RESET}")
    print()


def cmd_sprint_new(args):
    config = read_config()
    ensure_dir(os.path.join(SPRINT_DIR, "sprints"))

    # Find next sprint number
    sprints_dir = os.path.join(SPRINT_DIR, "sprints")
    files = sorted([f for f in os.listdir(sprints_dir) if f.endswith(".md")])
    next_num = 1
    if files:
        import re
        match = re.search(r"S(\d+)", files[-1])
        if match:
            next_num = int(match.group(1)) + 1

    sid = sprint_id(next_num)
    monday = monday_of(today())
    filename = f"{sid}_{monday}.md"
    goal = args.goal or "TBD"
    daily = str(args.daily) if args.daily else config.get("sprint.daily_duration", "30")
    days = str(args.days) if args.days else config.get("sprint.days_per_sprint", "5")
    retro_day = config.get("sprint.retro_day", "friday")
    total_hours = f"{int(days) * int(daily) / 60:.1f}"

    day_headers = "\n".join(
        f"## {DAYS_LONG[i]}\n- [ ] \n"
        for i in range(min(int(days), 5))
    )

    with open(os.path.join(sprints_dir, filename), "w") as f:
        f.write(f"""# Sprint {sid} — Week of {monday}

> Goal: {goal}
> Capacity: {days} dailies x {daily} min = {total_hours}h
> Retro: {retro_day}

{day_headers}
## Tickets

| ID | Description | Effort | Day | Status |
|----|-------------|--------|-----|--------|

## Metrics

| Metric | Start | End | Delta |
|--------|-------|-----|-------|
| Tickets done | 0 | | |
| Tests | | | |

## Notes

""")

    print(f"\n{GREEN}✓{RESET} Created sprint {BOLD}{sid}{RESET}: .sprint/sprints/{filename}")
    print(f"  Goal: {goal}")
    print(f"  Capacity: {days} days x {daily}min = {total_hours}h\n")


def cmd_retro(args):
    ensure_dir(os.path.join(SPRINT_DIR, "retros"))
    sprint_file = find_current_sprint()
    sid, done, todo = "S??", 0, 0
    if sprint_file:
        sid = os.path.basename(sprint_file).split("_")[0]
        content = open(sprint_file).read()
        done, todo = count_checkboxes(content)

    filename = f"RETRO_{sid}_{today()}.md"
    with open(os.path.join(SPRINT_DIR, "retros", filename), "w") as f:
        f.write(f"""# Retrospective {sid} — {today()} ({day_name()})

## 1. What went well

-

## 2. What didn't go well

-

## 3. Metrics

| Metric | Start | End | Delta |
|--------|-------|-----|-------|
| Tickets done | | {done} | |
| Tickets remaining | | {todo} | |
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
""")

    print(f"\n{GREEN}✓{RESET} Created retro: .sprint/retros/{filename}")
    print(f"  Sprint {sid}: {done} done, {todo} remaining")
    print(f"  Fill it in, then run {CYAN}sprintkit sync{RESET} to save.\n")


def cmd_backlog_add(args):
    desc = " ".join(args.description) if args.description else ""
    if not desc:
        print(f"\n{BOLD}Usage:{RESET} sprintkit backlog add <description> [options]")
        print(f"\n{BOLD}Options:{RESET}")
        print(f"  --priority P0-P4   Priority (default: P2)")
        print(f"  --effort XS-XL     Effort (default: M)")
        print(f"  --sprint S03       Assign to sprint")
        print(f"\n{BOLD}Examples:{RESET}")
        print(f'  {CYAN}sprintkit backlog add "Fix auth bug" --priority P1 --effort S{RESET}')
        print(f'  {CYAN}sprintkit backlog add "E2E tests" --priority P2 --effort L --sprint S03{RESET}\n')
        return

    priority = args.priority or "P2"
    effort = args.effort or "M"
    sprint = args.sprint or "—"

    backlog_path = os.path.join(SPRINT_DIR, "backlog.md")
    if not os.path.exists(backlog_path):
        print(f"{RED}No backlog found. Run: sprintkit init{RESET}")
        return

    import re
    content = open(backlog_path).read()
    ids = re.findall(r"T-(\d+)", content)
    max_id = max(int(i) for i in ids) if ids else 0
    new_id = f"T-{max_id + 1:03d}"
    new_line = f"| {new_id} | {priority} | {desc} | {effort} | {sprint} |"

    lines = content.split("\n")
    insert_idx = -1
    in_active = False
    for i, line in enumerate(lines):
        if line.startswith("## Active"):
            in_active = True
        if line.startswith("## Done") or line.startswith("## Icebox"):
            in_active = False
        if in_active and line.startswith("|") and "ID" not in line and "---" not in line:
            insert_idx = i

    if insert_idx >= 0:
        lines.insert(insert_idx + 1, new_line)
    else:
        done_idx = next((i for i, l in enumerate(lines) if l.startswith("## Done")), len(lines))
        lines.insert(done_idx, new_line)

    with open(backlog_path, "w") as f:
        f.write("\n".join(lines))

    print(f"\n{GREEN}✓{RESET} Added {BOLD}{new_id}{RESET}: {desc}")
    print(f"  Priority: {priority}  Effort: {effort}  Sprint: {sprint}\n")


def cmd_backlog_list(args):
    backlog_path = os.path.join(SPRINT_DIR, "backlog.md")
    if os.path.exists(backlog_path):
        print(open(backlog_path).read())
    else:
        print(f"{YELLOW}No backlog. Run: sprintkit init{RESET}")


def cmd_config(args):
    config_path = os.path.join(SPRINT_DIR, "config.yaml")
    if not os.path.exists(config_path):
        print(f"{YELLOW}No config found. Run: sprintkit init{RESET}")
        return

    config = read_config()
    print(f"\n{BOLD}SprintKit Configuration{RESET}")
    print(f"{DIM}File: {config_path}{RESET}\n")

    groups = {}
    for key, val in config.items():
        parts = key.split(".", 1)
        group = parts[0] if len(parts) > 1 else "other"
        name = parts[1] if len(parts) > 1 else parts[0]
        groups.setdefault(group, []).append((name, val))

    for group, items in groups.items():
        print(f"{CYAN}{group}:{RESET}")
        for name, val in items:
            print(f"  {name}: {BOLD}{val}{RESET}")

    print(f"\n{DIM}Edit {config_path} to change settings.{RESET}\n")


def cmd_sync(args):
    try:
        subprocess.run(["git", "add", SPRINT_DIR + "/", "CLAUDE.md"], capture_output=True, check=True)
        subprocess.run(["git", "commit", "-m", "sprint: update sprint files [sprintkit]"], capture_output=True, check=True)
        print(f"\n{GREEN}✓{RESET} Committed .sprint/ changes")
        try:
            subprocess.run(["git", "push"], capture_output=True, check=True)
            print(f"{GREEN}✓{RESET} Pushed to remote\n")
        except subprocess.CalledProcessError:
            print(f"{YELLOW}! Push failed (no remote or auth issue). Commit is local.{RESET}\n")
    except subprocess.CalledProcessError:
        print(f"\n{DIM}No changes to commit.{RESET}\n")


# ══════════════════════════════════════════════════════════════
# CLI parser
# ══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        prog="sprintkit",
        description="Turn any AI agent into an agile developer.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
examples:
  sprintkit init --daily 30 --agent claude
  sprintkit init --name "My SaaS" --days 4 --retro-day thursday
  sprintkit status
  sprintkit sprint new --goal "Launch MVP"
  sprintkit backlog add "Fix auth bug" --priority P1 --effort S
  sprintkit retro
  sprintkit sync

docs: https://github.com/2pidata/sprintkit
""",
    )
    parser.add_argument("--version", action="version", version=f"sprintkit {__version__}")
    sub = parser.add_subparsers(dest="command")

    # init
    p_init = sub.add_parser("init", help="Initialize .sprint/ in current project")
    p_init.add_argument("--name", help="Project name (default: directory name)")
    p_init.add_argument("--daily", type=int, default=30, help="Daily session duration in minutes (default: 30)")
    p_init.add_argument("--days", type=int, default=5, help="Working days per sprint (default: 5)")
    p_init.add_argument("--retro-day", default="friday", help="Retro day of week (default: friday)")
    p_init.add_argument("--agent", default="auto", choices=["auto", "claude", "cursor", "copilot", "aider", "windsurf"], help="AI agent type (default: auto)")
    p_init.add_argument("--force", action="store_true", help="Overwrite existing .sprint/")

    # status
    sub.add_parser("status", help="Show today's status")
    sub.add_parser("daily", help="Alias for status")

    # sprint
    p_sprint = sub.add_parser("sprint", help="Sprint management")
    sprint_sub = p_sprint.add_subparsers(dest="sprint_cmd")
    p_sprint_new = sprint_sub.add_parser("new", help="Create a new sprint")
    p_sprint_new.add_argument("--goal", help="Sprint goal")
    p_sprint_new.add_argument("--daily", type=int, help="Override daily duration (minutes)")
    p_sprint_new.add_argument("--days", type=int, help="Override working days per sprint")

    # backlog
    p_backlog = sub.add_parser("backlog", help="Backlog management")
    backlog_sub = p_backlog.add_subparsers(dest="backlog_cmd")
    p_bl_add = backlog_sub.add_parser("add", help="Add a ticket")
    p_bl_add.add_argument("description", nargs="*", help="Ticket description")
    p_bl_add.add_argument("--priority", choices=["P0", "P1", "P2", "P3", "P4"], help="Priority (default: P2)")
    p_bl_add.add_argument("--effort", choices=["XS", "S", "M", "L", "XL"], help="Effort (default: M)")
    p_bl_add.add_argument("--sprint", help="Assign to sprint (e.g. S03)")
    backlog_sub.add_parser("list", help="Show backlog")

    # retro
    sub.add_parser("retro", help="Generate retrospective template")

    # config
    sub.add_parser("config", help="Show configuration")

    # sync
    sub.add_parser("sync", help="Git commit + push .sprint/ changes")

    args = parser.parse_args()

    if args.command == "init":
        cmd_init(args)
    elif args.command in ("status", "daily"):
        cmd_status(args)
    elif args.command == "sprint":
        if args.sprint_cmd == "new":
            cmd_sprint_new(args)
        else:
            p_sprint.print_help()
    elif args.command == "backlog":
        if args.backlog_cmd == "add":
            cmd_backlog_add(args)
        elif args.backlog_cmd == "list":
            cmd_backlog_list(args)
        else:
            p_backlog.print_help()
    elif args.command == "retro":
        cmd_retro(args)
    elif args.command == "config":
        cmd_config(args)
    elif args.command == "sync":
        cmd_sync(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
