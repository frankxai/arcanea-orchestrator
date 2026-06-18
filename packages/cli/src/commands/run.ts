import { basename, resolve } from "node:path";
import chalk from "chalk";
import { InvalidArgumentError, type Command } from "commander";
import {
  createAgentRunRecord,
  detectMcpHealth,
  validateAgentRunRecord,
  type AgentRunLane,
  type AgentRunRuntime,
} from "@composio/ao-core";
import { git } from "../lib/shell.js";

const RUNTIMES = new Set<AgentRunRuntime>([
  "claude-code",
  "claude-agent-sdk",
  "codex",
  "opencode",
  "gemini",
  "grok",
  "higgsfield",
  "arcanea-studio",
  "custom",
]);

const LANES = new Set<AgentRunLane>([
  "interactive-subscription",
  "byok-api",
  "managed-arcanea",
  "dry-run",
]);

interface RunOptions {
  dryRun?: boolean;
  repo?: string;
  runtime?: string;
  lane?: string;
  worktree?: string;
  budgetUsd?: number;
  maxMinutes?: number;
  maxToolCalls?: number;
  json?: boolean;
}

export function registerRun(program: Command): void {
  program
    .command("run")
    .description("Create an Arcanea agent run record; dry-run is the current safe MVP")
    .argument("<objective...>", "Task objective")
    .option("--dry-run", "Plan only; deny side effects and do not launch an agent")
    .option("--repo <name>", "Repository name (defaults to current directory name)")
    .option("--worktree <path>", "Worktree path to attach to the planned run")
    .option("--runtime <runtime>", "Runtime: claude-code, codex, opencode, gemini, grok, higgsfield")
    .option("--lane <lane>", "Run lane: interactive-subscription, byok-api, managed-arcanea, dry-run")
    .option("--budget-usd <amount>", "Maximum USD budget; use 0 for dry runs", parseNonNegativeNumber)
    .option("--max-minutes <n>", "Maximum wall-clock minutes", parsePositiveInteger)
    .option("--max-tool-calls <n>", "Maximum tool calls", parseNonNegativeInteger)
    .option("--json", "Output JSON only")
    .action(async (objectiveParts: string[], opts: RunOptions) => {
      const objective = objectiveParts.join(" ").trim();
      const worktree = resolve(opts.worktree ?? process.cwd());
      const runtime = parseRuntime(opts.runtime ?? "codex");
      const lane = parseLane(opts.dryRun ? "dry-run" : (opts.lane ?? "interactive-subscription"));
      const branch = await git(["branch", "--show-current"], worktree);

      if (!opts.dryRun && lane !== "dry-run") {
        console.error(chalk.red("`ao run` currently supports safe planning only. Add --dry-run."));
        process.exit(1);
      }

      const record = createAgentRunRecord({
        objective,
        repo: opts.repo ?? basename(worktree),
        runtime,
        lane,
        branch: branch || null,
        worktree,
        mcp: detectMcpHealth(process.env),
        budget: {
          maxUsd: opts.budgetUsd,
          maxMinutes: opts.maxMinutes,
          maxToolCalls: opts.maxToolCalls,
        },
      });

      const errors = validateAgentRunRecord(record);
      if (errors.length > 0) {
        console.error(chalk.red("Invalid run record:"));
        for (const error of errors) console.error(chalk.red(`- ${error}`));
        process.exit(1);
      }

      if (opts.json || opts.dryRun) {
        console.log(JSON.stringify(record, null, 2));
        return;
      }

      console.log(chalk.green("Planned Arcanea agent run"));
      console.log(`  Run:     ${record.runId}`);
      console.log(`  Runtime: ${record.runtime}`);
      console.log(`  Lane:    ${record.lane}`);
      console.log(`  Repo:    ${record.repo}`);
      console.log(`  Branch:  ${record.branch ?? "-"}`);
    });
}

function parseRuntime(value: string): AgentRunRuntime {
  if (RUNTIMES.has(value as AgentRunRuntime)) return value as AgentRunRuntime;
  throw new Error(`Unsupported runtime "${value}". Use one of: ${Array.from(RUNTIMES).join(", ")}`);
}

function parseLane(value: string): AgentRunLane {
  if (LANES.has(value as AgentRunLane)) return value as AgentRunLane;
  throw new Error(`Unsupported lane "${value}". Use one of: ${Array.from(LANES).join(", ")}`);
}

function parseNonNegativeNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new InvalidArgumentError("expected a non-negative number");
  }
  return parsed;
}

function parsePositiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new InvalidArgumentError("expected a positive integer");
  }
  return parsed;
}

function parseNonNegativeInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new InvalidArgumentError("expected a non-negative integer");
  }
  return parsed;
}
