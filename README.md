# Arcanea Orchestrator

The **routing + planning + swarm brain** of the Arcanea Multi-Coding Agent System (AMCAS).

This repo hosts two related pieces under one roof:

1. **`@arcanea/orchestrator` npm package** — the headless dispatcher. Routes tasks to the right model across `claude`, `opencode`, `codex`, `gemini` based on `@arcanea/router-spec`. Install:

   ```bash
   npm i -g @arcanea/orchestrator
   arcanea-orchestrator doctor        # detect installed CLIs + infer auth tier
   arcanea-orchestrator status        # unified dashboard
   arcanea-orchestrator run --task code.debug "..."
   arcanea-orchestrator swarm --from backlog.md
   # short alias:
   arco doctor
   ```

2. **Maintained fork of Composio's Agent Orchestrator** — the session spawner with tmux + git-worktree isolation and a web dashboard on `:4200`. Used by the npm package's `swarm` command for worktree-isolated parallel execution.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  @arcanea/orchestrator   (npm, headless)             │
│  - routes (v1.0.0)                                   │
│  - plans (v1.1, roadmap)                             │
│  - swarms (delegates to ao batch-spawn)              │
│  - learns (v1.2, roadmap)                            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  ao (Composio fork)  —  session spawner              │
│  - git worktree per worker                           │
│  - tmux runtime per worker                           │
│  - web dashboard on :4200                            │
└─────────────────────────────────────────────────────┘
```

## What this is NOT

- Not a TUI. Run **[`arcanea-code`](https://github.com/frankxai/arcanea-code)** (OpenCode fork) for a rich daily-driver surface that sits *on top of* this orchestrator.
- Not the Arcanea product itself. This is the infrastructure layer; the product is at [arcanea.ai](https://arcanea.ai).

## Related

- **[@arcanea/orchestrator](https://www.npmjs.com/package/@arcanea/orchestrator)** — the npm package (home: this repo)
- **[@arcanea/router-spec](https://www.npmjs.com/package/@arcanea/router-spec)** — canonical routing declarations
- **[arcanea-code](https://github.com/frankxai/arcanea-code)** — rich TUI fork of OpenCode (daily driver)
- **[oh-my-arcanea](https://github.com/frankxai/oh-my-arcanea)** — OpenCode overlay (canon + skills + agents)
- **[claude-arcanea](https://github.com/frankxai/claude-arcanea)** — Claude Code overlay
- **[codex-arcanea](https://github.com/frankxai/codex-arcanea)** — OpenAI Codex overlay
- **[gemini-arcanea](https://github.com/frankxai/gemini-arcanea)** — Google Gemini overlay
- **[claude-codex-gemini-opencode-settings](https://github.com/frankxai/claude-codex-gemini-opencode-settings)** — curl-installable distribution

## License

MIT. See `LICENSE`. Upstream fork notices preserved where applicable. Provided "AS IS" without warranty. Not affiliated with Composio, Anthropic, OpenAI, Google, or any model provider.
