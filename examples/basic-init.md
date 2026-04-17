# Example: Basic Init

## Solo developer with Claude Code

```bash
# In your project directory
sprint-agent init --name "my-saas" --agent claude

# Your project now has:
# .sprint/AGENT.md      ← Claude Code reads this automatically
# .sprint/backlog.md    ← Add your tickets here
# .sprint/sprints/S01_* ← This week's plan
# CLAUDE.md             ← Points to .sprint/AGENT.md
```

## Add some tickets

```bash
sprint-agent backlog add "Setup auth with JWT" --priority P0 --effort M
sprint-agent backlog add "Create user registration" --priority P1 --effort M
sprint-agent backlog add "Add Stripe checkout" --priority P1 --effort L
sprint-agent backlog add "Write E2E tests" --priority P2 --effort L
sprint-agent backlog add "Mobile responsive" --priority P3 --effort M
```

## Check status

```bash
sprint-agent status
```

## Start working with Claude Code

Just open Claude Code in your project. It auto-reads `CLAUDE.md` and knows:
- What sprint you're on
- What tickets are planned
- What to work on next

## End of week

```bash
sprint-agent retro           # Generate retrospective
sprint-agent sprint new      # Plan next week
sprint-agent sync            # Save to git
```
