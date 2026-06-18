# Agent Stack Runtime Contract

Status: draft contract, June 16 2026.
Branch: `codex/agent-stack-runtime`.

## Purpose

Arcanea Orchestrator is the execution substrate beneath Arcanea Code, Arcanea Flow, and the app cockpit. Its job is to make many coding and creative agents feel like one controlled system without pretending they are the same runtime.

This contract defines the shared run shape for Claude Code, Claude Agent SDK, Codex, OpenCode, Gemini, Grok, Higgsfield/media agents, and future managed Arcanea workers.

## Runtime Lanes

Every run must declare a lane before work starts:

| Lane | Meaning | Allowed Default |
|---|---|---|
| `interactive-subscription` | user is present and using their local subscription/session | local worktree, human approval for side effects |
| `byok-api` | user/provider API key is attached to the run | explicit cost budget required |
| `managed-arcanea` | Arcanea-hosted worker or future paid runner | explicit cost budget and policy pack required |
| `dry-run` | plan, inspect, or simulate without writes | read-only tools only |

No autonomous run may start without a lane.

## Run Record

All runtimes should emit or be wrapped into this shape. The TypeScript contract is
exported from `@composio/ao-core` as `AgentRunRecord`; the ecosystem-level JSON
Schema lives in `arcanea-ecosystem/schemas/agent-run-record.schema.json`.

```json
{
  "runId": "run_01J...",
  "createdAt": "2026-06-16T00:00:00.000Z",
  "objective": "promote world engine",
  "repo": "arcanea-ai-app",
  "branch": "codex/world-engine-promotion",
  "worktree": "C:/Users/frank/starlight/repos/arcanea-ai-app/.worktrees/...",
  "runtime": "claude-code|claude-agent-sdk|codex|opencode|gemini|grok|higgsfield|custom",
  "lane": "interactive-subscription",
  "budget": {
    "maxUsd": 5,
    "maxMinutes": 45,
    "maxToolCalls": 200,
    "maxModelCalls": 80
  },
  "mcp": [
    { "name": "github", "state": "connected", "risk": ["write-capable", "external-side-effect"] },
    { "name": "higgsfield", "state": "missing-auth", "risk": ["cost-bearing", "external-side-effect"] }
  ],
  "approvals": {
    "filesystemWrites": "allowed-in-worktree",
    "destructiveShell": "ask",
    "externalWrites": "ask",
    "paidGeneration": "ask"
  },
  "status": "planned|running|needs-approval|failed|completed|aborted",
  "verification": [],
  "filesTouched": [],
  "handoverPath": null
}
```

## Required Gates

Before run:

- identify repo and branch;
- reject dirty default branch unless explicitly read-only;
- create or select a worktree;
- classify runtime lane;
- set budget;
- resolve MCP health;
- write task contract.

During run:

- stream progress events;
- record tool calls at least by class and count;
- record files touched;
- stop on budget breach;
- ask before destructive, external-write, paid-generation, or secret-transmitting actions.

After run:

- write concise handover;
- include verification evidence;
- leave no background process running unless the user explicitly asked;
- report merge posture and conflicts.

## Command Surface

Near-term AO commands should converge on:

```bash
ao doctor --json
ao status --json
ao mcp health --json
ao run --repo arcanea-ai-app --runtime codex --lane dry-run --dry-run "task"
ao run --repo arcanea-ai-app --runtime claude-code --worktree codex/example "task"
ao handover --run run_01J...
ao compare --runs run_a,run_b
```

`arcanea-code` can wrap these with a friendlier UX, but the substrate should stay machine-readable.

Implemented MVP:

```bash
ao run --dry-run --runtime codex --repo arcanea-ai-app "promote world engine"
ao mcp health --json
```

`ao run --dry-run` emits a planned `AgentRunRecord` with side effects denied and
current MCP/provider health attached. `ao mcp health --json` exposes the same
capability board directly. These commands do not launch an agent yet; that is
intentional until worktree creation and budget enforcement are wired into the
launcher.

## Runtime Responsibilities

| Runtime | Use For | Wrapper Responsibility |
|---|---|---|
| Claude Code CLI | high-context interactive edits | ensure worktree, capture `/usage` summary when possible, write handover |
| Claude Agent SDK | programmable/custom/CI agents | require BYOK/API or approved provider auth, enforce tool allowlist |
| Codex | implementation, review, local/cloud repo work | preserve branch directives and verification output |
| OpenCode | open/provider-flexible local loops | expose provider and model choice in run record |
| Gemini/Grok | visual/research/worldbuilding | classify paid media/tool calls and attach assets to run |
| Higgsfield/media | game/video/image generation | require paid-generation budget and asset manifest |

## MCP Health Contract

Each MCP/tool connector should report:

- `connected`, `missing-auth`, `expired`, `unavailable`, or `disabled`;
- read/write/destructive/cost-bearing risk flags;
- last successful call timestamp when known;
- required env or login hint;
- safe default permissions.

The app cockpit should show this as a capability board. The CLI should expose it as JSON.

## Arcanea Code Handoff

`arcanea-code` should treat AO as the durable substrate, not as a competing UI.
The smooth local UX can be built around the same record:

1. `arcanea-code doctor` gathers installed agents, auth lane hints, MCP health,
   repo cleanliness, Node/package manager state, and provider risk flags.
2. `arcanea-code run --dry-run` writes an `AgentRunRecord` with `status:
   "planned"` and no writes.
3. `arcanea-code run` creates or selects the worktree, launches Claude Code,
   Codex, OpenCode, or another runtime, and keeps appending verification,
   touched files, and handover path.
4. The Vercel app reads the same record as a timeline. No duplicate state model.

This lets users bring their own subscriptions today while keeping a clean path
to managed Arcanea workers later.

## Budget Behavior

Budgets are not only token limits. Track:

- wall-clock runtime;
- model-call count;
- tool-call count;
- paid media generation count;
- web/code execution count;
- spawned subagent count;
- rough USD estimate when available.

When exact provider cost is unknown, show an estimate band and mark it as estimated. Unknown cost is never treated as zero cost.

## Worktree And Merge Discipline

- Never run write-capable agents on dirty `main`.
- Never merge old broad integration branches wholesale.
- Prefer path-scoped transplants for stale agent branches.
- Keep Higgsfield/media adapters separate from world-engine promotion until both are verified.
- Use `ao compare` or a Merge Room review before combining parallel agent outputs.

## Future Managed Execution

Managed Arcanea workers should use the same run record. The only difference is where the agent loop runs:

- local today;
- Arcanea-hosted sandbox later;
- private/team runner for enterprise.

This keeps the product honest: BYOK now, managed convenience later, same UX and audit trail.
