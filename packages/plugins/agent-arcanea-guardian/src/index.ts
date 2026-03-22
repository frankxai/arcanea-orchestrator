/**
 * Arcanea Guardian Agent Plugin
 *
 * Wraps any agent backend with the Arcanea Intelligence OS — assigning a
 * Guardian from the Ten Gates to each task based on keywords and file patterns,
 * and injecting creative-intelligence context into the agent's system prompt.
 *
 * This is a "decorator" plugin: it delegates all actual agent operations to
 * an inner agent (defaulting to claude-code) and adds the Guardian prompt
 * layer on top. The inner agent handles launching, activity detection,
 * session info, and process management.
 */

import type {
  Agent,
  AgentLaunchConfig,
  AgentSessionInfo,
  ActivityDetection,
  ActivityState,
  PluginModule,
  ProjectConfig,
  RuntimeHandle,
  Session,
  WorkspaceHooksConfig,
} from "@composio/ao-core";

import { buildGuardianPrompt, buildGuardianTag } from "./guardian-prompt.js";
import { routeToGuardian, getAllGuardians, getGuardianByName, type RouteContext } from "./guardian-router.js";

// Re-export for consumers
export { buildGuardianPrompt, buildGuardianTag } from "./guardian-prompt.js";
export {
  routeToGuardian,
  getAllGuardians,
  getGuardianByName,
  getGuardianByGate,
  GUARDIANS,
  type GuardianDefinition,
  type RouteContext,
} from "./guardian-router.js";

// =============================================================================
// Plugin Manifest
// =============================================================================

export const manifest = {
  name: "arcanea-guardian",
  slot: "agent" as const,
  description: "Agent plugin: Arcanea Guardian — wraps any agent with Arcanea Intelligence OS",
  version: "0.1.0",
  displayName: "Arcanea Guardian",
};

// =============================================================================
// Configuration
// =============================================================================

export interface GuardianPluginConfig {
  /**
   * The inner agent instance to delegate to. If not provided, the plugin
   * will create a minimal passthrough that expects an external agent to
   * be composed at runtime.
   */
  innerAgent?: Agent;

  /**
   * Default Guardian override (by name). When set, all tasks route to
   * this Guardian regardless of keyword/file matching.
   */
  defaultGuardian?: string;

  /**
   * Whether to include the full Ten Gates table in prompts (default: true).
   * Set to false for shorter prompts when token budget is tight.
   */
  includeGatesContext?: boolean;
}

// =============================================================================
// Agent Implementation
// =============================================================================

function createGuardianAgent(config: GuardianPluginConfig = {}): Agent {
  const { innerAgent, defaultGuardian, includeGatesContext = true } = config;

  /**
   * Extract routing context from an AgentLaunchConfig.
   * Uses the prompt text for keyword matching and any file paths
   * mentioned in the prompt for file-pattern matching.
   */
  function extractRouteContext(launchConfig: AgentLaunchConfig): RouteContext {
    const context: RouteContext = {
      taskPrompt: launchConfig.prompt,
    };

    if (defaultGuardian) {
      context.guardianOverride = defaultGuardian;
    }

    // Extract file paths mentioned in the prompt (heuristic)
    if (launchConfig.prompt) {
      const fileRefs = extractFilePaths(launchConfig.prompt);
      if (fileRefs.length > 0) {
        context.filePaths = fileRefs;
      }
    }

    return context;
  }

  return {
    name: "arcanea-guardian",
    processName: innerAgent?.processName ?? "claude",
    promptDelivery: innerAgent?.promptDelivery ?? "post-launch",

    getLaunchCommand(launchConfig: AgentLaunchConfig): string {
      if (!innerAgent) {
        throw new Error(
          "GuardianAgent requires an innerAgent to generate launch commands. " +
          "Configure one via the plugin config or compose with another agent plugin.",
        );
      }

      // Route to Guardian and build the enhanced system prompt
      const routeContext = extractRouteContext(launchConfig);
      const guardian = routeToGuardian(routeContext);
      const guardianPrompt = buildGuardianPrompt({
        guardian,
        taskPrompt: launchConfig.prompt,
        agentRules: launchConfig.projectConfig.agentRules as string | undefined,
        includeGatesContext,
      });

      // Compose: Guardian prompt prepended to any existing system prompt
      const enhancedConfig: AgentLaunchConfig = {
        ...launchConfig,
        systemPrompt: guardianPrompt + (launchConfig.systemPrompt ? "\n\n" + launchConfig.systemPrompt : ""),
      };

      return innerAgent.getLaunchCommand(enhancedConfig);
    },

    getEnvironment(launchConfig: AgentLaunchConfig): Record<string, string> {
      const baseEnv = innerAgent?.getEnvironment(launchConfig) ?? {};

      // Route to Guardian and inject metadata as environment variables
      const routeContext = extractRouteContext(launchConfig);
      const guardian = routeToGuardian(routeContext);

      return {
        ...baseEnv,
        ARCANEA_GUARDIAN: guardian.name,
        ARCANEA_GATE: guardian.gate,
        ARCANEA_ELEMENT: guardian.element,
        ARCANEA_FREQUENCY: guardian.frequency,
      };
    },

    detectActivity(terminalOutput: string): ActivityState {
      if (innerAgent) {
        return innerAgent.detectActivity(terminalOutput);
      }
      // Minimal fallback — can't do much without an inner agent
      if (!terminalOutput.trim()) return "idle";
      return "active";
    },

    async isProcessRunning(handle: RuntimeHandle): Promise<boolean> {
      if (innerAgent) {
        return innerAgent.isProcessRunning(handle);
      }
      return false;
    },

    async getActivityState(
      session: Session,
      readyThresholdMs?: number,
    ): Promise<ActivityDetection | null> {
      if (innerAgent?.getActivityState) {
        return innerAgent.getActivityState(session, readyThresholdMs);
      }
      return null;
    },

    async getSessionInfo(session: Session): Promise<AgentSessionInfo | null> {
      if (innerAgent) {
        const info = await innerAgent.getSessionInfo(session);
        if (info) {
          // Annotate summary with Guardian tag
          const guardian = session.metadata["arcanea_guardian"]
            ? getGuardianByName(session.metadata["arcanea_guardian"])
            : undefined;
          if (guardian && info.summary) {
            const tag = buildGuardianTag(guardian);
            info.summary = `${tag} ${info.summary}`;
          }
        }
        return info;
      }
      return null;
    },

    async getRestoreCommand(session: Session, project: ProjectConfig): Promise<string | null> {
      if (innerAgent?.getRestoreCommand) {
        return innerAgent.getRestoreCommand(session, project);
      }
      return null;
    },

    async setupWorkspaceHooks(workspacePath: string, hooksConfig: WorkspaceHooksConfig): Promise<void> {
      if (innerAgent?.setupWorkspaceHooks) {
        await innerAgent.setupWorkspaceHooks(workspacePath, hooksConfig);
      }
    },

    async postLaunchSetup(session: Session): Promise<void> {
      if (innerAgent?.postLaunchSetup) {
        await innerAgent.postLaunchSetup(session);
      }
    },
  };
}

// =============================================================================
// File Path Extraction (Heuristic)
// =============================================================================

/**
 * Extract likely file paths from a prompt string.
 *
 * Looks for patterns like:
 *   - src/components/Button.tsx
 *   - packages/core/index.ts
 *   - migrations/001_init.sql
 *   - glob patterns like *.test.ts
 */
function extractFilePaths(text: string): string[] {
  // Match sequences that look like file paths:
  // - Start with a word char or dot
  // - Contain at least one slash
  // - End with a file extension
  const pathPattern = /(?:^|\s)([\w.*][\w.*/\\-]*\.[\w*]+)/g;
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pathPattern.exec(text)) !== null) {
    const candidate = match[1]!.trim();
    // Filter out URLs and very short matches
    if (candidate.includes("/") && !candidate.startsWith("http") && candidate.length > 3) {
      paths.push(candidate);
    }
  }
  return paths;
}

// =============================================================================
// Plugin Export
// =============================================================================

export function create(config?: Record<string, unknown>): Agent {
  const pluginConfig: GuardianPluginConfig = {};

  if (config) {
    if (config["innerAgent"] && typeof config["innerAgent"] === "object") {
      pluginConfig.innerAgent = config["innerAgent"] as Agent;
    }
    if (typeof config["defaultGuardian"] === "string") {
      pluginConfig.defaultGuardian = config["defaultGuardian"];
    }
    if (typeof config["includeGatesContext"] === "boolean") {
      pluginConfig.includeGatesContext = config["includeGatesContext"];
    }
  }

  return createGuardianAgent(pluginConfig);
}

export function detect(): boolean {
  // The Guardian plugin is always available — it's a wrapper, not a binary.
  return true;
}

export default { manifest, create, detect } satisfies PluginModule<Agent>;
