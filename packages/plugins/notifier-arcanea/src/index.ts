import { mkdir, writeFile, appendFile } from "node:fs/promises";
import { dirname } from "node:path";
import type {
  EventPriority,
  EventType,
  Notifier,
  NotifyAction,
  NotifyContext,
  OrchestratorEvent,
  PluginModule,
} from "@composio/ao-core";

export const manifest = {
  name: "arcanea",
  slot: "notifier" as const,
  description: "Notifier plugin: Arcanea-themed Guardian notifications with session logging",
  version: "0.1.0",
};

// ---------------------------------------------------------------------------
// Canon: The Ten Gates & Their Guardians
// ---------------------------------------------------------------------------

interface Guardian {
  name: string;
  gate: string;
  frequency: string;
  domain: string;
}

const GUARDIANS: Guardian[] = [
  { name: "Lyssandria", gate: "Foundation", frequency: "174 Hz", domain: "Earth, survival" },
  { name: "Leyla", gate: "Flow", frequency: "285 Hz", domain: "Creativity, emotion" },
  { name: "Draconia", gate: "Fire", frequency: "396 Hz", domain: "Power, will" },
  { name: "Maylinn", gate: "Heart", frequency: "417 Hz", domain: "Love, healing" },
  { name: "Alera", gate: "Voice", frequency: "528 Hz", domain: "Truth, expression" },
  { name: "Lyria", gate: "Sight", frequency: "639 Hz", domain: "Intuition, vision" },
  { name: "Aiyami", gate: "Crown", frequency: "741 Hz", domain: "Enlightenment" },
  { name: "Elara", gate: "Starweave", frequency: "852 Hz", domain: "Perspective, transformation" },
  { name: "Ino", gate: "Unity", frequency: "963 Hz", domain: "Partnership" },
  { name: "Shinkami", gate: "Source", frequency: "1111 Hz", domain: "Meta-consciousness" },
];

// ---------------------------------------------------------------------------
// Notification type -> Guardian mapping
// ---------------------------------------------------------------------------

type ArcaneanNotificationType =
  | "session_started"
  | "session_completed"
  | "ci_failed"
  | "review_requested"
  | "merge_ready";

/**
 * Map event types to Arcanean notification categories.
 * Unknown events default to a generic Guardian message.
 */
function classifyEvent(event: OrchestratorEvent): ArcaneanNotificationType | null {
  const t: EventType = event.type;

  if (t === "session.spawned") return "session_started";
  if (t === "session.exited") return "session_completed";
  if (t === "ci.failing" || t === "ci.fix_failed") return "ci_failed";
  if (t === "review.pending" || t === "review.changes_requested") return "review_requested";
  if (t === "merge.ready" || t === "review.approved" || t === "summary.all_complete") return "merge_ready";

  return null;
}

/**
 * Each notification type is presided over by a Guardian whose domain
 * resonates with the nature of the work.
 */
const GUARDIAN_BY_TYPE: Record<ArcaneanNotificationType, Guardian> = {
  session_started: GUARDIANS[0],  // Lyssandria — Foundation: beginning of work
  session_completed: GUARDIANS[6], // Aiyami — Crown: enlightenment upon completion
  ci_failed: GUARDIANS[2],         // Draconia — Fire: the forge rejects impure code
  review_requested: GUARDIANS[5],  // Lyria — Sight: vision to judge the work
  merge_ready: GUARDIANS[8],       // Ino — Unity: partnership of branches
};

const THEMED_MESSAGES: Record<ArcaneanNotificationType, (g: Guardian, event: OrchestratorEvent) => string> = {
  session_started: (g, event) =>
    `${g.name} opens the Gate of ${g.gate} (${g.frequency}). A new session begins: ${event.sessionId}. The foundation is laid.`,
  session_completed: (g, event) =>
    `${g.name} seals the Gate of ${g.gate}. Session ${event.sessionId} is complete. Enlightenment achieved.`,
  ci_failed: (g, event) =>
    `${g.name}'s forge has rejected the offering. The Gate of ${g.gate} demands purity. CI failed for ${event.sessionId}: ${event.message}`,
  review_requested: (g, event) =>
    `${g.name} turns the Eye of ${g.gate} upon the code. Review requested for ${event.sessionId}. Let truth be seen.`,
  merge_ready: (g, event) =>
    `${g.name} blesses the union at the Gate of ${g.gate}. Session ${event.sessionId} is ready to merge. Two streams become one.`,
};

/**
 * Fallback for events that don't map to a specific notification type.
 * Selects a Guardian based on priority.
 */
function fallbackGuardian(priority: EventPriority): Guardian {
  switch (priority) {
    case "urgent":
      return GUARDIANS[2]; // Draconia — Fire: urgency demands power
    case "action":
      return GUARDIANS[4]; // Alera — Voice: action requires expression
    case "warning":
      return GUARDIANS[5]; // Lyria — Sight: foresight for warnings
    case "info":
    default:
      return GUARDIANS[3]; // Maylinn — Heart: gentle info
  }
}

// ---------------------------------------------------------------------------
// Session file paths
// ---------------------------------------------------------------------------

const SESSION_DIR = "/tmp/arcanea-session";
const LOG_PATH = `${SESSION_DIR}/orchestrator.log`;
const GUARDIAN_PATH = "/tmp/arcanea-guardian";
const GATE_PATH = "/tmp/arcanea-gate";

// ---------------------------------------------------------------------------
// File I/O helpers
// ---------------------------------------------------------------------------

async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

async function safeWriteFile(filePath: string, content: string): Promise<void> {
  try {
    await ensureDir(dirname(filePath));
    await writeFile(filePath, content, "utf-8");
  } catch (err) {
    console.warn(`[notifier-arcanea] Failed to write ${filePath}: ${err instanceof Error ? err.message : err}`);
  }
}

async function safeAppendFile(filePath: string, content: string): Promise<void> {
  try {
    await ensureDir(dirname(filePath));
    await appendFile(filePath, content, "utf-8");
  } catch (err) {
    console.warn(`[notifier-arcanea] Failed to append to ${filePath}: ${err instanceof Error ? err.message : err}`);
  }
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function formatLogEntry(event: OrchestratorEvent, guardian: Guardian, themedMessage: string): string {
  const ts = event.timestamp instanceof Date ? event.timestamp.toISOString() : new Date().toISOString();
  return `[${ts}] [${event.priority.toUpperCase()}] [${guardian.name}/${guardian.gate}] ${event.type} | ${themedMessage}\n`;
}

function formatTitle(event: OrchestratorEvent, guardian: Guardian): string {
  const prefix = event.priority === "urgent" ? "URGENT" : "Arcanea";
  return `${prefix} [${guardian.gate}] ${event.sessionId}`;
}

function formatActionsLine(actions: NotifyAction[]): string {
  if (actions.length === 0) return "";
  const labels = actions.map((a) => a.label).join(", ");
  return `\nActions available: ${labels}`;
}

// ---------------------------------------------------------------------------
// Core notification logic
// ---------------------------------------------------------------------------

async function processEvent(event: OrchestratorEvent): Promise<{ guardian: Guardian; message: string }> {
  const classification = classifyEvent(event);

  let guardian: Guardian;
  let message: string;

  if (classification) {
    guardian = GUARDIAN_BY_TYPE[classification];
    message = THEMED_MESSAGES[classification](guardian, event);
  } else {
    guardian = fallbackGuardian(event.priority);
    message = `${guardian.name} at the Gate of ${guardian.gate} speaks: ${event.message}`;
  }

  // Write session files in parallel
  const logEntry = formatLogEntry(event, guardian, message);
  await Promise.all([
    safeAppendFile(LOG_PATH, logEntry),
    safeWriteFile(GUARDIAN_PATH, guardian.name),
    safeWriteFile(GATE_PATH, guardian.gate),
  ]);

  return { guardian, message };
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function create(_config?: Record<string, unknown>): Notifier {
  return {
    name: "arcanea",

    async notify(event: OrchestratorEvent): Promise<void> {
      const { message } = await processEvent(event);
      console.log(`[notifier-arcanea] ${message}`);
    },

    async notifyWithActions(event: OrchestratorEvent, actions: NotifyAction[]): Promise<void> {
      const { guardian, message } = await processEvent(event);
      const actionsLine = formatActionsLine(actions);
      const title = formatTitle(event, guardian);
      console.log(`[notifier-arcanea] ${title}: ${message}${actionsLine}`);
    },

    async post(message: string, context?: NotifyContext): Promise<string | null> {
      const ts = new Date().toISOString();
      const sessionId = context?.sessionId ?? "unknown";
      const logEntry = `[${ts}] [INFO] [post] session=${sessionId} | ${message}\n`;
      await safeAppendFile(LOG_PATH, logEntry);
      console.log(`[notifier-arcanea] ${message}`);
      return null;
    },
  };
}

export default { manifest, create } satisfies PluginModule<Notifier>;
