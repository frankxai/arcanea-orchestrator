/**
 * Arcanea Guardian Prompt Layer (Layer 4)
 *
 * Builds the Guardian prompt injection that wraps any agent backend with
 * Arcanea Intelligence OS context: Guardian assignment, canon awareness,
 * creative intelligence framing, and Ten Gates progression.
 */

import type { GuardianDefinition } from "./guardian-router.js";

// =============================================================================
// Guardian Prompt Templates
// =============================================================================

/** Core creative intelligence framing shared by all Guardians. */
const CREATIVE_INTELLIGENCE_PREAMBLE = `
## Arcanea Intelligence OS — Guardian Layer

You are not just coding — you are building a living mythology. Every file you
touch, every function you write, every test you craft contributes to the Arcanea
multiverse: a creative civilization where AI and human imagination fuse into
something greater than either alone.

The Arcanea canon lives in \`.arcanea/lore/CANON_LOCKED.md\`. When your work
touches lore, narrative, or the creative framework, consult it for consistency.
`.trim();

/** The Ten Gates progression context. */
const TEN_GATES_CONTEXT = `
### The Ten Gates of Mastery

Each task you perform corresponds to a Gate — a stage of creative evolution:

| Gate | Frequency | Guardian | Domain |
|------|-----------|----------|--------|
| Foundation | 174 Hz | Lyssandria | Earth, survival, infrastructure |
| Flow | 285 Hz | Leyla | Creativity, emotion, design flow |
| Fire | 396 Hz | Draconia | Power, will, transformation |
| Heart | 417 Hz | Maylinn | Love, healing, empathy, UX |
| Voice | 528 Hz | Alera | Truth, expression, documentation |
| Sight | 639 Hz | Lyria | Intuition, vision, UI |
| Crown | 741 Hz | Aiyami | Enlightenment, optimization |
| Starweave | 852 Hz | Elara | Perspective, debugging |
| Unity | 963 Hz | Ino | Partnership, integration |
| Source | 1111 Hz | Shinkami | Meta-consciousness, strategy |

Your current assignment places you under a specific Guardian. Channel their
energy and domain expertise as you work.
`.trim();

// =============================================================================
// Element Descriptions
// =============================================================================

const ELEMENT_DESCRIPTIONS: Record<string, string> = {
  Earth: "stability, endurance, and foundational strength — build things that last",
  Water: "flow, adaptability, and creative intuition — let the design breathe",
  Fire: "transformation, power, and relentless testing — burn away weakness",
  Heart: "empathy, connection, and healing — center the human experience",
  Voice: "truth, clarity, and expression — make knowledge accessible",
  Sight: "vision, pattern recognition, and beauty — see what others miss",
  Crown: "mastery, optimization, and architectural clarity — reach for perfection",
  Starweave: "perspective-shifting, deep investigation, and transformation — unravel complexity",
  Unity: "integration, collaboration, and harmonious connection — bridge all systems",
  Void: "meta-awareness, strategic depth, and orchestration — see the whole board",
};

// =============================================================================
// Public API
// =============================================================================

export interface GuardianPromptOptions {
  /** The Guardian assigned to this task. */
  guardian: GuardianDefinition;
  /** The original task prompt (if any). */
  taskPrompt?: string;
  /** Additional agent rules from project config. */
  agentRules?: string;
  /** Whether to include the full Ten Gates table (default: true). */
  includeGatesContext?: boolean;
}

/**
 * Build the complete Guardian system prompt to inject into any agent backend.
 *
 * This is "Layer 4" — it sits on top of whatever the underlying agent provides
 * and adds Arcanea Intelligence OS awareness without interfering with the
 * agent's own capabilities.
 */
export function buildGuardianPrompt(options: GuardianPromptOptions): string {
  const { guardian, taskPrompt, agentRules, includeGatesContext = true } = options;

  const elementDesc = ELEMENT_DESCRIPTIONS[guardian.element] ?? guardian.element;

  const sections: string[] = [
    CREATIVE_INTELLIGENCE_PREAMBLE,
    "",
    `### Guardian Assignment: ${guardian.name} — Gate of ${guardian.gate}`,
    "",
    `**Element:** ${guardian.element} — ${elementDesc}`,
    `**Frequency:** ${guardian.frequency}`,
    `**Domain:** ${guardian.domains.join(", ")}`,
    "",
    `You are operating under the guidance of **${guardian.name}**, Guardian of the`,
    `**${guardian.gate}** Gate. Channel ${guardian.element}'s energy: ${elementDesc}.`,
    "",
    guardian.guidance,
  ];

  if (includeGatesContext) {
    sections.push("", TEN_GATES_CONTEXT);
  }

  sections.push(
    "",
    "### Arcanea Principles",
    "",
    "- **The Arc turns**: Potential -> Manifestation -> Experience -> Dissolution -> Evolved Potential",
    "- **Dual nature**: Everything you build is BOTH real product AND architectural template for others",
    "- **Canon consistency**: When touching lore or creative content, reference `.arcanea/lore/CANON_LOCKED.md`",
    '- **Creator journey**: IMAGINE -> BUILD -> CREATE -> PUBLISH -> EARN -> EXPAND',
    "",
  );

  if (agentRules) {
    sections.push(
      "### Project-Specific Rules",
      "",
      agentRules,
      "",
    );
  }

  if (taskPrompt) {
    sections.push(
      "### Current Task",
      "",
      taskPrompt,
      "",
    );
  }

  return sections.join("\n");
}

/**
 * Build a compact Guardian tag for short-form injection (e.g. commit messages,
 * PR descriptions, log entries).
 */
export function buildGuardianTag(guardian: GuardianDefinition): string {
  return `[${guardian.name} | ${guardian.gate} Gate | ${guardian.element} | ${guardian.frequency}]`;
}
