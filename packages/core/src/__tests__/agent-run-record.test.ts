import { describe, expect, it } from "vitest";
import {
  createAgentRunRecord,
  defaultAgentRunApprovals,
  defaultAgentRunBudget,
  validateAgentRunRecord,
} from "../agent-run-record.js";

describe("agent run records", () => {
  it("creates a dry-run record with side effects denied", () => {
    const record = createAgentRunRecord({
      objective: "inspect Arcanea agent stack",
      repo: "arcanea-orchestrator",
      runtime: "codex",
      lane: "dry-run",
      branch: "codex/agent-stack-runtime",
      worktree: "C:/tmp/arcanea-orchestrator",
    });

    expect(record.runId).toMatch(/^run_/);
    expect(record.status).toBe("planned");
    expect(record.budget.maxToolCalls).toBe(0);
    expect(record.approvals.filesystemWrites).toBe("deny");
    expect(record.approvals.paidGeneration).toBe("deny");
    expect(record.mergePosture).toBe("none");
    expect(validateAgentRunRecord(record)).toEqual([]);
  });

  it("defaults interactive subscription runs to worktree writes and human approval for external effects", () => {
    expect(defaultAgentRunBudget("interactive-subscription")).toMatchObject({
      maxUsd: null,
      maxMinutes: 45,
      maxToolCalls: 200,
    });
    expect(defaultAgentRunApprovals("interactive-subscription")).toMatchObject({
      filesystemWrites: "allowed-in-worktree",
      destructiveShell: "ask",
      externalWrites: "ask",
      paidGeneration: "ask",
    });
  });

  it("reports invalid dry-run approval drift", () => {
    const record = createAgentRunRecord({
      objective: "simulate",
      repo: "arcanea-code",
      runtime: "opencode",
      lane: "dry-run",
      approvals: { externalWrites: "ask" },
    });

    expect(validateAgentRunRecord(record)).toContain(
      "dry-run approvals must deny writes, destructive shell, external writes, and paid generation",
    );
  });

  it("does not let undefined partial inputs erase defaults", () => {
    const record = createAgentRunRecord({
      objective: "plan",
      repo: "arcanea-orchestrator",
      runtime: "codex",
      lane: "dry-run",
      budget: {
        maxUsd: undefined,
        maxMinutes: undefined,
        maxToolCalls: undefined,
      },
      approvals: {
        paidGeneration: undefined,
      },
    });

    expect(record.budget.maxMinutes).toBe(15);
    expect(record.budget.maxToolCalls).toBe(0);
    expect(record.approvals.paidGeneration).toBe("deny");
    expect(validateAgentRunRecord(record)).toEqual([]);
  });

  it("rejects non-finite and fractional budget values", () => {
    const record = createAgentRunRecord({
      objective: "plan",
      repo: "arcanea-orchestrator",
      runtime: "codex",
      lane: "dry-run",
      budget: {
        maxUsd: Number.NaN,
        maxMinutes: Number.NaN,
        maxToolCalls: 1.5,
      },
    });

    expect(validateAgentRunRecord(record)).toEqual([
      "budget.maxMinutes must be a positive integer",
      "budget.maxToolCalls must be a non-negative integer",
      "budget.maxUsd must be null or a non-negative finite number",
    ]);
  });
});
