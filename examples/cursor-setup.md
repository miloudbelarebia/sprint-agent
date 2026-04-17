# Example: Cursor Setup

```bash
sprint-agent init --agent cursor --daily 45

# Creates:
# .sprint/AGENT.md
# .cursorrules       ← Cursor reads this automatically
# CLAUDE.md          ← Also created (works if you switch agents)
```

When you open Cursor, it reads `.cursorrules` which points to `.sprint/AGENT.md`.
The agent immediately knows your sprint context.
