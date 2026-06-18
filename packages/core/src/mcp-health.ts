import type { AgentRunMcpConnector, AgentRunToolRisk } from "./types.js";

export interface McpToolDefinition {
  name: string;
  risk: AgentRunToolRisk[];
  envKeys?: string[];
  loginHint?: string;
  connectedWhenNoAuth?: boolean;
}

export const DEFAULT_MCP_TOOL_DEFINITIONS: readonly McpToolDefinition[] = [
  {
    name: "filesystem",
    risk: ["read-only", "write-capable"],
    connectedWhenNoAuth: true,
    loginHint: "Local workspace access is available through AO worktrees.",
  },
  {
    name: "github",
    risk: ["read-only", "write-capable", "external-side-effect"],
    envKeys: ["GITHUB_TOKEN", "GH_TOKEN"],
    loginHint: "Run `gh auth login` or set GITHUB_TOKEN/GH_TOKEN.",
  },
  {
    name: "supabase",
    risk: ["read-only", "write-capable", "secret-bearing", "external-side-effect"],
    envKeys: ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    loginHint: "Set Supabase URL and key env vars for derived index/cache access.",
  },
  {
    name: "vercel",
    risk: ["read-only", "write-capable", "external-side-effect"],
    envKeys: ["VERCEL_TOKEN"],
    loginHint: "Run `vercel login` or set VERCEL_TOKEN.",
  },
  {
    name: "higgsfield",
    risk: ["cost-bearing", "external-side-effect"],
    envKeys: ["HIGGSFIELD_API_KEY", "HIGGSFIELD_TOKEN"],
    loginHint: "Connect the Higgsfield MCP or set HIGGSFIELD_API_KEY/HIGGSFIELD_TOKEN.",
  },
  {
    name: "figma",
    risk: ["read-only", "write-capable", "external-side-effect"],
    envKeys: ["FIGMA_ACCESS_TOKEN", "FIGMA_TOKEN"],
    loginHint: "Connect Figma or set FIGMA_ACCESS_TOKEN.",
  },
  {
    name: "canva",
    risk: ["read-only", "write-capable", "external-side-effect"],
    envKeys: ["CANVA_API_TOKEN"],
    loginHint: "Connect Canva before design export or mutation workflows.",
  },
  {
    name: "slack",
    risk: ["read-only", "write-capable", "external-side-effect"],
    envKeys: ["SLACK_BOT_TOKEN", "SLACK_WEBHOOK_URL"],
    loginHint: "Connect Slack or set SLACK_BOT_TOKEN/SLACK_WEBHOOK_URL.",
  },
  {
    name: "notion",
    risk: ["read-only", "write-capable", "external-side-effect"],
    envKeys: ["NOTION_TOKEN", "NOTION_API_KEY"],
    loginHint: "Connect Notion or set NOTION_TOKEN.",
  },
  {
    name: "google-workspace",
    risk: ["read-only", "write-capable", "external-side-effect", "secret-bearing"],
    envKeys: ["GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_CLIENT_ID"],
    loginHint: "Connect Google Drive/Gmail/Calendar before workspace actions.",
  },
];

export function detectMcpHealth(
  env: NodeJS.ProcessEnv = process.env,
  definitions: readonly McpToolDefinition[] = DEFAULT_MCP_TOOL_DEFINITIONS,
): AgentRunMcpConnector[] {
  return definitions.map((definition) => {
    const hasAuth = definition.connectedWhenNoAuth || hasAnyEnv(env, definition.envKeys ?? []);
    return {
      name: definition.name,
      state: hasAuth ? "connected" : "missing-auth",
      risk: definition.risk,
      loginHint: hasAuth ? null : (definition.loginHint ?? null),
    };
  });
}

function hasAnyEnv(env: NodeJS.ProcessEnv, keys: readonly string[]): boolean {
  return keys.some((key) => {
    const value = env[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}
