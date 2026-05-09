#!/usr/bin/env bash
# Reproducible demo for Sprint Agent README/launch.
#
# To record as GIF for the README:
#   brew install asciinema agg
#   asciinema rec -c "bash scripts/demo.sh" docs/demo.cast
#   agg --theme monokai docs/demo.cast docs/demo.gif
#
# To preview locally (no recording):
#   bash scripts/demo.sh

set -e

# Slow type effect — adjust SLEEP for recording cadence
SLEEP="${SLEEP:-0.8}"
PROMPT="\033[36m$\033[0m "

type() {
  local cmd="$1"
  printf "${PROMPT}"
  for ((i=0; i<${#cmd}; i++)); do
    printf "%s" "${cmd:i:1}"
    sleep 0.02
  done
  echo
  sleep 0.4
  eval "$cmd"
  sleep "$SLEEP"
}

DEMO_DIR=$(mktemp -d)
cd "$DEMO_DIR"
git init -q
echo "# My SaaS" > README.md
git add . && git commit -q -m "init" 2>/dev/null || true

clear
echo
echo "  Sprint Agent demo — turn any AI agent into an agile developer"
echo "  ──────────────────────────────────────────────────────────────"
sleep 1.5

type "sprint-agent init --name 'My SaaS' --daily 30 --agent claude"
type "sprint-agent backlog add 'Fix auth redirect loop' --priority P1 --effort S"
type "sprint-agent backlog add 'Add Stripe checkout flow' --priority P1 --effort M"
type "sprint-agent backlog add 'Write E2E tests' --priority P2 --effort L"
type "sprint-agent status"

echo
echo "  ✨ Now your AI agent reads .sprint/AGENT.md instead of re-exploring"
echo "     the codebase every session. 83% less context tokens."
echo
sleep 2

cd /
rm -rf "$DEMO_DIR"
