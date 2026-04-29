# VHS tape — Sprint Agent demo
#
# Generate the demo GIF:
#   1. Install VHS: brew install vhs   (or see https://github.com/charmbracelet/vhs)
#   2. Run:        vhs demo.tape
#   3. Output:     docs/demo.gif
#   4. Uncomment the demo image line in README.md and commit.

Output docs/demo.gif

Set FontSize 16
Set Width 1100
Set Height 700
Set Theme "Dracula"
Set TypingSpeed 40ms
Set PlaybackSpeed 1.0
Set Padding 20
Set Margin 10

# Setup: fresh project dir
Hide
Type "rm -rf /tmp/sa-demo && mkdir /tmp/sa-demo && cd /tmp/sa-demo" Enter
Type "clear" Enter
Show

# 1. Init
Type "# 1. Initialize a sprint board for your project"
Sleep 1s
Enter
Type "sprint-agent init --name 'My SaaS' --agent claude --daily 30"
Sleep 500ms
Enter
Sleep 3s

# 2. Add tickets
Type "# 2. Add tickets to the backlog"
Sleep 800ms
Enter
Type "sprint-agent backlog add 'Fix auth redirect loop' --priority P1 --effort S"
Sleep 300ms
Enter
Sleep 1s
Type "sprint-agent backlog add 'Add Stripe checkout' --priority P1 --effort L"
Sleep 300ms
Enter
Sleep 1s
Type "sprint-agent backlog add 'E2E Playwright tests' --priority P2 --effort L"
Sleep 300ms
Enter
Sleep 2s

# 3. Status — the daily check
Type "# 3. Daily status — what's on your plate today"
Sleep 800ms
Enter
Type "sprint-agent status"
Sleep 300ms
Enter
Sleep 4s

# 4. Show the .sprint/ directory
Type "# 4. Everything lives in plain markdown"
Sleep 800ms
Enter
Type "ls .sprint/"
Sleep 200ms
Enter
Sleep 2s

# 5. The agent reads this
Type "# 5. Your AI agent reads CLAUDE.md → AGENT.md → today's sprint"
Sleep 1s
Enter
Type "head -10 .sprint/AGENT.md"
Sleep 200ms
Enter
Sleep 4s

# Outro
Type "# That's it. Open Claude Code → it knows your sprint. Ship."
Sleep 2s
Enter
Sleep 2s
