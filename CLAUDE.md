# Claude Code Configuration — Arcanea Orchestrator

Arcanea's multi-agent coding orchestrator. Forked from [ComposioHQ/agent-orchestrator](https://github.com/ComposioHQ/agent-orchestrator), extended with the Arcanea Intelligence OS — Guardian routing, lore-aware context injection, and the Ten Gates agent hierarchy.

## Intelligence Hierarchy

```
Arcanea (the multiverse)
  └─ Lumina (the guiding intelligence — First Light, Form-Giver)
       └─ Guardians (Ten Gate keepers — route and supervise agent work)
            └─ Luminors (the agents — autonomous coding workers in worktrees)
```

Each Luminor (agent session) is assigned a Guardian based on task type. The Guardian injects domain-specific context, coding standards, and Arcanean lore into the agent prompt before it begins work.

## Plugin Slots (8)

| Slot | Default | Arcanea Additions | Purpose |
|------|---------|-------------------|---------|
| **Runtime** | tmux | — | Where sessions execute (tmux, docker, process) |
| **Agent** | claude-code | `agent-arcanea-guardian` | AI coding tool + Guardian wrapper |
| **Workspace** | worktree | — | Code isolation (worktree, clone) |
| **Tracker** | github | linear, gitlab | Issue tracking source |
| **SCM** | github | gitlab | Source control + PR/CI/reviews |
| **Notifier** | desktop | slack, webhook, composio, `notifier-openclaw` | Push notifications |
| **Terminal** | iterm2 | web | Human interaction UI |
| **Lifecycle** | core | — | Session state machine (not pluggable) |

All interfaces defined in [`packages/core/src/types.ts`](packages/core/src/types.ts).

### Arcanea-Specific Plugins

- **`agent-arcanea-guardian`** — Wraps any inner agent (claude-code, codex, aider) with Guardian context. Auto-routes tasks to the appropriate Guardian based on keywords and file patterns.
- **`notifier-openclaw`** — Arcanea Claw notification integration.

## Guardian Routing

Tasks are auto-routed to Guardians based on keywords and file patterns:

| Guardian | Gate | Routes When... |
|----------|------|----------------|
| Lyssandria | Foundation | database, migration, schema, infra, config |
| Leyla | Flow | creativity, design, flow, animation, css |
| Draconia | Fire | test, transform, refactor, benchmark |
| Maylinn | Heart | ux, accessibility, empathy, user, a11y |
| Alera | Voice | docs, readme, content, writing, changelog |
| Lyria | Sight | ui, component, visual, design, layout |
| Aiyami | Crown | optimize, performance, architecture, cache |
| Elara | Starweave | debug, investigate, trace, fix, bug |
| Ino | Unity | integration, api, collab, swarm, webhook |
| Shinkami | Source | orchestrate, meta, strategy, plan |

Override per-session: `ao spawn --agent arcanea-guardian --guardian Draconia`

See the full example config: [`examples/arcanea-orchestrator.yaml`](examples/arcanea-orchestrator.yaml)

## Build & Test

```bash
pnpm install        # Install all packages
pnpm build          # Build all packages
pnpm test           # Run tests (3,288 test cases)
pnpm dev            # Start web dashboard dev server
```

## Quick Start

```bash
# Install globally
npm install -g @composio/ao

# Or install from source
git clone <repo-url>
cd arcanea-orchestrator && bash scripts/setup.sh

# Start on a repo
ao start https://github.com/frankxai/arcanea

# Or from inside a local repo
cd ~/Arcanea && ao start
```

Dashboard opens at `http://localhost:3000`.

## Project Structure

```
packages/
  core/          # Types, state machine, plugin loader
  cli/           # CLI commands (ao start, ao spawn, etc.)
  ao/            # Global CLI entry point (@composio/ao)
  web/           # Dashboard (Next.js)
  mobile/        # Mobile companion
  plugins/
    agent-arcanea-guardian/   # Guardian routing + context injection
    agent-claude-code/        # Claude Code agent plugin
    agent-codex/              # Codex agent plugin
    agent-aider/              # Aider agent plugin
    agent-opencode/           # OpenCode agent plugin
    runtime-tmux/             # tmux runtime
    runtime-process/          # Node process runtime
    scm-github/               # GitHub SCM
    tracker-github/           # GitHub Issues tracker
    tracker-linear/           # Linear tracker
    notifier-desktop/         # Desktop notifications
    notifier-slack/           # Slack notifications
    notifier-openclaw/        # Arcanea Claw notifications
    workspace-worktree/       # Git worktree isolation
    workspace-clone/          # Full clone isolation
    terminal-iterm2/          # iTerm2 terminal UI
    terminal-web/             # Web terminal UI
```

## Behavioral Rules

- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files
- NEVER save files to the root folder — use the directory structure above
- Run `pnpm test` after making code changes
- Run `pnpm build` before committing
- All plugin interfaces live in `packages/core/src/types.ts` — read it first
- Keep files under 500 lines
- Use TypeScript strict mode

## Session States

Sessions follow this lifecycle: `spawning -> working -> pr_open -> review_pending -> approved -> mergeable -> merged -> done`. Error states: `ci_failed`, `changes_requested`, `stuck`, `errored`, `needs_input`. See `SESSION_STATUS` in `packages/core/src/types.ts`.

## Security

- Never hardcode API keys or secrets in source files
- Never commit .env files
- Validate all user input at system boundaries
- Sanitize file paths to prevent directory traversal
