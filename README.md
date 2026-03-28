# Arcanea Orchestrator
Arcanea Orchestrator is Arcanea's maintained Agent Orchestrator fork for multi-agent coding workflows, worktrees, and swarm supervision.
## What this repo is
- A maintained fork of Agent Orchestrator shaped for Arcanea workflows
- The orchestration layer for coordinating parallel coding agents across repositories
- A control plane for worktrees, issue routing, review loops, and autonomous execution
## Install
`ash
git clone https://github.com/frankxai/arcanea-orchestrator.git
cd arcanea-orchestrator
pnpm install
pnpm build
`
## How this relates to Arcanea
Arcanea Orchestrator is not the Arcanea product itself. It is the swarm execution layer used alongside Arcanea Code, Oh My Arcanea, and the main Arcanea platform when work needs to be coordinated across multiple agents.
## Related repos
- [arcanea](https://github.com/frankxai/arcanea): the main Arcanea platform mirror
- [arcanea-code](https://github.com/frankxai/arcanea-code): the coding CLI used by individual agents
- [oh-my-arcanea](https://github.com/frankxai/oh-my-arcanea): overlay layer for Guardian-aware coding workflows
## License
See the repository license and upstream fork notices for usage terms.