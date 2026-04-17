# Example: Weekend Warrior

Build a side project in 2-hour weekend sessions:

```bash
sprint-agent init --daily 120 --days 2 --retro-day sunday

# Sprint = Saturday + Sunday
# Each day = 2 hours of focused work
# Retro on Sunday evening
```

```bash
sprint-agent backlog add "MVP landing page" --priority P0 --effort L
sprint-agent backlog add "Auth + database" --priority P0 --effort L
sprint-agent backlog add "Core feature" --priority P1 --effort XL
sprint-agent backlog add "Deploy to production" --priority P1 --effort M
```

Each sprint = 4 hours total. Ship your MVP in 2-3 weekends.
