/**
 * Arcanea Guardian Router
 *
 * Routes tasks to the appropriate Guardian based on file patterns,
 * task keywords, and explicit overrides. Each Guardian maps to one
 * of the Ten Gates and carries domain-specific guidance.
 */

// =============================================================================
// Guardian Definitions
// =============================================================================

export interface GuardianDefinition {
  /** Guardian name (e.g. "Lyssandria") */
  name: string;
  /** Gate name (e.g. "Foundation") */
  gate: string;
  /** Elemental affinity */
  element: string;
  /** Solfeggio frequency */
  frequency: string;
  /** Domain keywords used for routing */
  keywords: string[];
  /** File path patterns that trigger this Guardian */
  filePatterns: string[];
  /** Domains this Guardian oversees */
  domains: string[];
  /** Specific guidance injected into the prompt */
  guidance: string;
}

export const GUARDIANS: readonly GuardianDefinition[] = [
  {
    name: "Lyssandria",
    gate: "Foundation",
    element: "Earth",
    frequency: "174 Hz",
    keywords: ["database", "migration", "schema", "infra", "config", "setup", "docker", "ci", "deploy", "env"],
    filePatterns: [
      "**/*.sql",
      "**/migrations/**",
      "**/schema/**",
      "**/infra/**",
      "**/docker*",
      "**/.env*",
      "**/Dockerfile",
      "**/docker-compose*",
      "**/terraform/**",
      "**/config/**",
    ],
    domains: ["database", "migration", "schema", "infrastructure", "configuration"],
    guidance:
      "Build on bedrock. Lyssandria demands that every foundation be unshakable — " +
      "validate schemas, handle migrations with care, and ensure infrastructure " +
      "survives chaos. Earth endures; so must your code.",
  },
  {
    name: "Leyla",
    gate: "Flow",
    element: "Water",
    frequency: "285 Hz",
    keywords: ["creativity", "design", "flow", "animation", "transition", "motion", "style", "css", "theme"],
    filePatterns: [
      "**/*.css",
      "**/*.scss",
      "**/*.less",
      "**/styles/**",
      "**/themes/**",
      "**/animations/**",
      "**/design-tokens/**",
    ],
    domains: ["creativity", "design", "flow", "animation", "styling"],
    guidance:
      "Let it flow. Leyla channels Water's adaptability — designs should breathe, " +
      "animations should feel natural, and creative solutions should emerge like " +
      "a river finding its path. Never force; guide.",
  },
  {
    name: "Draconia",
    gate: "Fire",
    element: "Fire",
    frequency: "396 Hz",
    keywords: ["test", "transform", "refactor", "power", "perf", "benchmark", "burn", "destroy", "rewrite"],
    filePatterns: [
      "**/*.test.*",
      "**/*.spec.*",
      "**/__tests__/**",
      "**/tests/**",
      "**/test/**",
      "**/benchmarks/**",
    ],
    domains: ["testing", "transformation", "refactoring", "power"],
    guidance:
      "Burn away weakness. Draconia's Fire transforms — tests must be ruthless, " +
      "refactors must be fearless, and every transformation must emerge stronger. " +
      "If it can break, break it in tests before production breaks it for you.",
  },
  {
    name: "Maylinn",
    gate: "Heart",
    element: "Heart",
    frequency: "417 Hz",
    keywords: ["ux", "accessibility", "empathy", "user", "a11y", "i18n", "onboarding", "error-message", "help"],
    filePatterns: [
      "**/a11y/**",
      "**/accessibility/**",
      "**/i18n/**",
      "**/locales/**",
      "**/onboarding/**",
    ],
    domains: ["UX", "accessibility", "empathy", "user experience"],
    guidance:
      "Center the human. Maylinn's Heart energy demands empathy in every " +
      "interaction — error messages should comfort, accessibility must never be " +
      "an afterthought, and every user path should feel like someone cares. " +
      "Because someone does: you.",
  },
  {
    name: "Alera",
    gate: "Voice",
    element: "Voice",
    frequency: "528 Hz",
    keywords: ["docs", "readme", "content", "writing", "documentation", "comment", "changelog", "blog", "guide"],
    filePatterns: [
      "**/*.md",
      "**/*.mdx",
      "**/docs/**",
      "**/content/**",
      "**/book/**",
      "CHANGELOG*",
      "README*",
      "CONTRIBUTING*",
    ],
    domains: ["documentation", "content", "writing", "communication"],
    guidance:
      "Speak truth clearly. Alera's Voice carries at 528 Hz — the frequency of " +
      "transformation. Documentation is not busywork; it is the bridge between " +
      "what exists and what others can build. Write so that a stranger can " +
      "understand, and a master can appreciate.",
  },
  {
    name: "Lyria",
    gate: "Sight",
    element: "Sight",
    frequency: "639 Hz",
    keywords: ["ui", "component", "visual", "design", "layout", "page", "view", "render", "svg", "icon"],
    filePatterns: [
      "**/components/**",
      "**/ui/**",
      "**/pages/**",
      "**/views/**",
      "**/layouts/**",
      "**/*.tsx",
      "**/*.jsx",
      "**/*.svg",
    ],
    domains: ["UI", "components", "visual design", "layout"],
    guidance:
      "See what others miss. Lyria's Sight reveals the invisible architecture of " +
      "visual experience — component hierarchies, spacing rhythms, color " +
      "relationships. Build interfaces that are not just functional but " +
      "beautiful, because beauty is a form of usability.",
  },
  {
    name: "Aiyami",
    gate: "Crown",
    element: "Crown",
    frequency: "741 Hz",
    keywords: ["optimize", "performance", "architecture", "scale", "cache", "index", "bundle", "tree-shake"],
    filePatterns: [
      "**/core/**",
      "**/lib/**",
      "**/utils/**",
      "**/services/**",
      "**/webpack*",
      "**/vite*",
      "**/tsconfig*",
      "**/turbo*",
    ],
    domains: ["optimization", "performance", "architecture", "scalability"],
    guidance:
      "Reach for mastery. Aiyami's Crown energy seeks the highest form of every " +
      "solution — the algorithm with the best complexity, the architecture that " +
      "scales gracefully, the optimization that respects both machine and " +
      "maintainer. Enlightenment is code that needs no explanation.",
  },
  {
    name: "Elara",
    gate: "Starweave",
    element: "Starweave",
    frequency: "852 Hz",
    keywords: ["debug", "investigate", "perspective", "trace", "log", "diagnose", "fix", "bug", "issue"],
    filePatterns: [
      "**/debug/**",
      "**/logging/**",
      "**/tracing/**",
      "**/diagnostics/**",
    ],
    domains: ["debugging", "investigation", "perspective", "diagnostics"],
    guidance:
      "Shift perspective. Elara weaves between viewpoints at 852 Hz — what looks " +
      "like a rendering bug from the frontend may be a data issue from the " +
      "backend. Follow the thread across layers. The bug is never where you " +
      "first look; Starweave sees the connections others miss.",
  },
  {
    name: "Ino",
    gate: "Unity",
    element: "Unity",
    frequency: "963 Hz",
    keywords: ["integration", "api", "collab", "swarm", "merge", "sync", "webhook", "event", "pubsub", "queue"],
    filePatterns: [
      "**/api/**",
      "**/routes/**",
      "**/integrations/**",
      "**/webhooks/**",
      "**/events/**",
      "**/plugins/**",
    ],
    domains: ["integration", "API", "collaboration", "swarm coordination"],
    guidance:
      "Bridge all things. Ino's Unity energy harmonizes disparate systems into " +
      "one coherent whole — APIs that feel intuitive, integrations that fail " +
      "gracefully, event systems that scale. Partnership at 963 Hz means every " +
      "component trusts every other.",
  },
  {
    name: "Shinkami",
    gate: "Source",
    element: "Void",
    frequency: "1111 Hz",
    keywords: ["orchestrate", "meta", "strategy", "plan", "architect", "system", "design-system", "monorepo"],
    filePatterns: [
      "**/orchestrator/**",
      "**/strategy/**",
      "**/planning/**",
      "**/meta/**",
      "package.json",
      "pnpm-workspace.yaml",
      "turbo.json",
    ],
    domains: ["orchestration", "meta-consciousness", "strategy", "system design"],
    guidance:
      "See the whole board. Shinkami operates at Source — 1111 Hz, the frequency " +
      "of meta-consciousness. From here you see not just the code but the " +
      "system, not just the system but the ecosystem, not just the ecosystem " +
      "but the civilization being built. Every decision ripples outward.",
  },
] as const;

/** Map of Guardian name to definition for direct lookup. */
const GUARDIAN_BY_NAME = new Map<string, GuardianDefinition>(
  GUARDIANS.map((g) => [g.name.toLowerCase(), g]),
);

/** Map of Gate name to Guardian for gate-based lookup. */
const GUARDIAN_BY_GATE = new Map<string, GuardianDefinition>(
  GUARDIANS.map((g) => [g.gate.toLowerCase(), g]),
);

// =============================================================================
// Routing Logic
// =============================================================================

export interface RouteContext {
  /** The task description or prompt. */
  taskPrompt?: string;
  /** Files being touched by this task. */
  filePaths?: string[];
  /** Explicit Guardian name override. */
  guardianOverride?: string;
  /** Explicit Gate name override. */
  gateOverride?: string;
}

interface ScoredGuardian {
  guardian: GuardianDefinition;
  score: number;
}

/**
 * Route a task to the most appropriate Guardian.
 *
 * Priority order:
 *   1. Explicit override (guardianOverride or gateOverride)
 *   2. Keyword matching against taskPrompt
 *   3. File pattern matching against filePaths
 *   4. Default fallback: Shinkami (Source — the meta-orchestrator)
 */
export function routeToGuardian(context: RouteContext): GuardianDefinition {
  // 1. Explicit override
  if (context.guardianOverride) {
    const found = GUARDIAN_BY_NAME.get(context.guardianOverride.toLowerCase());
    if (found) return found;
  }
  if (context.gateOverride) {
    const found = GUARDIAN_BY_GATE.get(context.gateOverride.toLowerCase());
    if (found) return found;
  }

  const scores: ScoredGuardian[] = GUARDIANS.map((g) => ({ guardian: g, score: 0 }));

  // 2. Keyword matching
  if (context.taskPrompt) {
    const promptLower = context.taskPrompt.toLowerCase();
    for (const entry of scores) {
      for (const keyword of entry.guardian.keywords) {
        if (promptLower.includes(keyword)) {
          entry.score += 2;
        }
      }
    }
  }

  // 3. File pattern matching (simplified glob-to-substring matching)
  if (context.filePaths && context.filePaths.length > 0) {
    for (const entry of scores) {
      for (const filePath of context.filePaths) {
        const normalized = filePath.replace(/\\/g, "/").toLowerCase();
        for (const pattern of entry.guardian.filePatterns) {
          if (matchSimpleGlob(normalized, pattern.toLowerCase())) {
            entry.score += 1;
          }
        }
      }
    }
  }

  // Find highest score
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  // 4. Fallback to Shinkami if no matches
  if (!best || best.score === 0) {
    return GUARDIANS[GUARDIANS.length - 1]!; // Shinkami
  }

  return best.guardian;
}

/**
 * Simplified glob matching for file path routing.
 *
 * Supports:
 *   - `**` matches any number of path segments
 *   - `*` matches any characters within a single segment
 *   - Literal directory/extension matching
 *
 * This is intentionally simple — for full glob support, use a proper
 * globbing library. The router only needs rough matching to pick the
 * right Guardian, not exact file selection.
 */
function matchSimpleGlob(filePath: string, pattern: string): boolean {
  // Handle ** prefix patterns like "**/components/**"
  if (pattern.startsWith("**/")) {
    const suffix = pattern.slice(3);
    // Check if the suffix is a directory pattern like "components/**"
    if (suffix.endsWith("/**")) {
      const dir = suffix.slice(0, -3);
      return filePath.includes(`/${dir}/`) || filePath.startsWith(`${dir}/`);
    }
    // Check if suffix is a file extension pattern like "*.test.*"
    if (suffix.startsWith("*.")) {
      const ext = suffix.slice(1); // e.g. ".test.*" or ".sql"
      if (ext.endsWith(".*")) {
        // Pattern like "*.test.*" — match files containing ".test."
        const middle = ext.slice(0, -2); // ".test"
        return filePath.includes(middle);
      }
      return filePath.endsWith(ext);
    }
    // Literal filename match anywhere in path
    return filePath.endsWith(`/${suffix}`) || filePath === suffix;
  }

  // Handle exact filename patterns like "package.json", "CHANGELOG*"
  if (!pattern.includes("/")) {
    const fileName = filePath.split("/").pop() ?? filePath;
    if (pattern.endsWith("*")) {
      return fileName.startsWith(pattern.slice(0, -1));
    }
    return fileName === pattern;
  }

  // Fallback: substring containment
  return filePath.includes(pattern.replace(/\*\*/g, "").replace(/\*/g, ""));
}

/**
 * Get all Guardians (useful for configuration UIs and documentation).
 */
export function getAllGuardians(): readonly GuardianDefinition[] {
  return GUARDIANS;
}

/**
 * Look up a Guardian by name (case-insensitive).
 */
export function getGuardianByName(name: string): GuardianDefinition | undefined {
  return GUARDIAN_BY_NAME.get(name.toLowerCase());
}

/**
 * Look up a Guardian by Gate name (case-insensitive).
 */
export function getGuardianByGate(gate: string): GuardianDefinition | undefined {
  return GUARDIAN_BY_GATE.get(gate.toLowerCase());
}
