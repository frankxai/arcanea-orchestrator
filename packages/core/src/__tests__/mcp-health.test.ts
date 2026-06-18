import { describe, expect, it } from "vitest";
import { detectMcpHealth } from "../mcp-health.js";

describe("mcp health", () => {
  it("marks local filesystem as connected without auth", () => {
    const health = detectMcpHealth({});
    const filesystem = health.find((item) => item.name === "filesystem");

    expect(filesystem).toMatchObject({
      state: "connected",
      risk: ["read-only", "write-capable"],
    });
  });

  it("marks provider tools missing-auth when no auth hints are present", () => {
    const health = detectMcpHealth({});
    const github = health.find((item) => item.name === "github");
    const higgsfield = health.find((item) => item.name === "higgsfield");

    expect(github).toMatchObject({
      state: "missing-auth",
      loginHint: "Run `gh auth login` or set GITHUB_TOKEN/GH_TOKEN.",
    });
    expect(higgsfield?.risk).toContain("cost-bearing");
  });

  it("marks provider tools connected when an auth hint is present", () => {
    const health = detectMcpHealth({
      GITHUB_TOKEN: "token",
      HIGGSFIELD_API_KEY: "higgs",
    });

    expect(health.find((item) => item.name === "github")?.state).toBe("connected");
    expect(health.find((item) => item.name === "higgsfield")?.state).toBe("connected");
  });
});
