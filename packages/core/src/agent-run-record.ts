import { randomUUID } from "node:crypto";
import type {
  AgentRunApprovals,
  AgentRunBudget,
  AgentRunLane,
  AgentRunMcpConnector,
  AgentRunRecord,
  AgentRunRuntime,
} from "./types.js";

export interface CreateAgentRunRecordInput {
  objective: string;
  repo: string;
  runtime: AgentRunRuntime;
  lane: AgentRunLane;
  branch?: string | null;
  worktree?: string | null;
  budget?: Partial<AgentRunBudget>;
  approvals?: Partial<AgentRunApprovals>;
  mcp?: AgentRunMcpConnector[];
}

export function createAgentRunId(): `run_${string}` {
  return `run_${randomUUID().replaceAll("-", "")}`;
}

export function defaultAgentRunBudget(lane: AgentRunLane): AgentRunBudget {
  return {
    maxUsd: lane === "interactive-subscription" || lane === "dry-run" ? null : 5,
    maxMinutes: lane === "dry-run" ? 15 : 45,
    maxToolCalls: lane === "dry-run" ? 0 : 200,
    maxModelCalls: lane === "dry-run" ? 0 : 80,
    maxSubagents: lane === "dry-run" ? 0 : 4,
    costEstimateUsd: null,
    costEstimateConfidence: "unknown",
  };
}

export function defaultAgentRunApprovals(lane: AgentRunLane): AgentRunApprovals {
  if (lane === "dry-run") {
    return {
      filesystemWrites: "deny",
      destructiveShell: "deny",
      externalWrites: "deny",
      paidGeneration: "deny",
      secretTransmission: "deny",
    };
  }

  return {
    filesystemWrites: "allowed-in-worktree",
    destructiveShell: "ask",
    externalWrites: "ask",
    paidGeneration: "ask",
    secretTransmission: "ask",
  };
}

export function createAgentRunRecord(input: CreateAgentRunRecordInput): AgentRunRecord {
  const now = new Date().toISOString();
  const budget: AgentRunBudget = {
    ...defaultAgentRunBudget(input.lane),
    ...withoutUndefined(input.budget),
  };
  const approvals: AgentRunApprovals = {
    ...defaultAgentRunApprovals(input.lane),
    ...withoutUndefined(input.approvals),
  };

  return {
    runId: createAgentRunId(),
    createdAt: now,
    updatedAt: now,
    objective: input.objective,
    repo: input.repo,
    branch: input.branch ?? null,
    worktree: input.worktree ?? null,
    runtime: input.runtime,
    lane: input.lane,
    budget,
    mcp: input.mcp ?? [],
    approvals,
    status: "planned",
    verification: [],
    filesTouched: [],
    handoverPath: null,
    mergePosture: laneToMergePosture(input.lane),
  };
}

export function validateAgentRunRecord(record: AgentRunRecord): string[] {
  const errors: string[] = [];

  if (!record.runId.startsWith("run_")) errors.push("runId must start with run_");
  if (!record.objective.trim()) errors.push("objective is required");
  if (!record.repo.trim()) errors.push("repo is required");
  if (!Number.isInteger(record.budget.maxMinutes) || record.budget.maxMinutes < 1) {
    errors.push("budget.maxMinutes must be a positive integer");
  }
  if (!Number.isInteger(record.budget.maxToolCalls) || record.budget.maxToolCalls < 0) {
    errors.push("budget.maxToolCalls must be a non-negative integer");
  }
  if (
    record.budget.maxUsd !== null &&
    record.budget.maxUsd !== undefined &&
    (!Number.isFinite(record.budget.maxUsd) || record.budget.maxUsd < 0)
  ) {
    errors.push("budget.maxUsd must be null or a non-negative finite number");
  }
  if (record.lane !== "dry-run" && record.budget.maxUsd === undefined) {
    errors.push("non-dry-run records must declare maxUsd, even when null");
  }
  if (record.lane === "dry-run") {
    const approvals = record.approvals;
    if (
      approvals.filesystemWrites !== "deny" ||
      approvals.destructiveShell !== "deny" ||
      approvals.externalWrites !== "deny" ||
      approvals.paidGeneration !== "deny"
    ) {
      errors.push("dry-run approvals must deny writes, destructive shell, external writes, and paid generation");
    }
  }

  return errors;
}

function laneToMergePosture(lane: AgentRunLane): AgentRunRecord["mergePosture"] {
  return lane === "dry-run" ? "none" : "needs-merge-room";
}

function withoutUndefined<T extends Record<string, unknown>>(value: Partial<T> | undefined): Partial<T> {
  if (!value) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Partial<T>;
}
