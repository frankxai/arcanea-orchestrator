# Repository Instructions

This repo is part of the FrankX / Starlight / Arcanea agent estate.

## Classification

- Repo: `arcanea-orchestrator`
- Class: maintained fork of Composio's Agent Orchestrator (`@composio/ao`), extended with the `@arcanea/orchestrator` npm package — the routing/planning/swarm brain of the Arcanea Multi-Coding Agent System
- Default health command: `pnpm test` (runs the workspace test suite, excluding `@composio/ao-web`). Also run `pnpm build` before committing, per this repo's own `CLAUDE.md`.
- Remote: https://github.com/frankxai/arcanea-orchestrator

## What this repo is

Two related pieces under one roof: (1) `@arcanea/orchestrator`, a headless dispatcher that routes tasks to `claude`/`opencode`/`codex`/`gemini` per `@arcanea/router-spec`; (2) the maintained Composio Agent Orchestrator fork (`ao`) — a session spawner with tmux + git-worktree isolation and a web dashboard on `:4200` that the npm package's `swarm` command delegates to. This repo has a full `CLAUDE.md` with the Guardian-routing hierarchy (Arcanea → Lumina → Guardians → Luminors), plugin slots, and session-state machine — **read `CLAUDE.md` first**, this file is the cross-harness summary.

## Agent Rules

- Read this file and `CLAUDE.md` before making changes.
- Preserve existing user work and unrelated dirty files.
- Keep edits scoped to the requested task.
- Prefer existing repo conventions over new abstractions.
- Run the health command before handoff when feasible.
- Do not publish secrets, private memory, credentials, or internal-only strategy.

## Class-Specific Guidance

- Never save files to the repo root — use the `packages/*` structure documented in `CLAUDE.md`.
- All plugin interfaces live in `packages/core/src/types.ts` — read it before adding or changing a plugin (runtime, agent, workspace, tracker, SCM, notifier, terminal).
- World work should route as repo-native tasks against isolated worktrees running `@arcanea/world-sdk` commands — this orchestrator should not centralize canon or bulk-merge world branches; promotion work uses path-scoped branches (e.g. `codex/world-engine-promotion`).
- This is a fork — preserve upstream Composio attribution/notices; this is not the Arcanea product itself (that's arcanea.ai), it's the infrastructure layer underneath `arcanea-code` and the harness overlays.
- Keep files under 500 lines and TypeScript strict mode, per `CLAUDE.md`.

## Handoff

Summarize changed files, validation run, risks, and any follow-up needed.

## Design Taste Kernel

For any site, app, landing page, dashboard, visual identity, brand, motion, media, social, or frontend task, apply the shared Design Taste Kernel before handoff:

- C:\Users\frank\starlight\repos\DESIGN_TASTE.md
- C:\Users\frank\starlight\repos\WEB_EXPERIENCE_STANDARD.md
- C:\Users\frank\starlight\repos\MOTION_TASTE_RUBRIC.md
- C:\Users\frank\starlight\repos\MULTI_AGENT_DESIGN_COUNCIL.md
- C:\Users\frank\starlight\repos\VISUAL_QA_GATE.md

When motion, scroll, generated media, GIF/video, or premium polish matters, route through the Motion Design Studio plugin/skills and verify the result visually. This applies mainly to `packages/web` (the dashboard) — the CLI/core packages are not visual surfaces.
