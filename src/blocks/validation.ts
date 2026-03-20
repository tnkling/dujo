import type {
  Block,
  BlockType,
  TextBlock,
  ChecklistBlock,
  HabitTrackerBlock,
  ChecklistItem,
  HabitItem,
} from "./types";

// Update when adding new block types to types.ts
const BLOCK_TYPES: BlockType[] = ["text", "checklist", "habit-tracker"];

function isValidBlockType(value: unknown): value is BlockType {
  return typeof value === "string" && BLOCK_TYPES.includes(value as BlockType);
}

function isValidChecklistItem(value: unknown): value is ChecklistItem {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.text === "string" &&
    typeof o.checked === "boolean"
  );
}

function isValidTextBlock(value: unknown): value is TextBlock {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    o.type === "text" &&
    typeof o.content === "string"
  );
}

function isValidChecklistBlock(value: unknown): value is ChecklistBlock {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    o.type !== "checklist" ||
    typeof o.title !== "string"
  ) {
    return false;
  }
  if (!Array.isArray(o.items)) return false;
  return o.items.every(isValidChecklistItem);
}

function isValidHabitItem(value: unknown): value is HabitItem {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.done === "boolean"
  );
}

function isValidHabitTrackerBlock(
  value: unknown
): value is HabitTrackerBlock {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    o.type !== "habit-tracker" ||
    typeof o.title !== "string"
  ) {
    return false;
  }
  if (!Array.isArray(o.habits)) return false;
  return o.habits.every(isValidHabitItem);
}

function repairTextBlock(value: Record<string, unknown>): TextBlock | null {
  const id = typeof value.id === "string" ? value.id : crypto.randomUUID();
  const content = typeof value.content === "string" ? value.content : "";
  return { id, type: "text", content };
}

function repairChecklistItem(value: Record<string, unknown>): ChecklistItem {
  const id = typeof value.id === "string" ? value.id : crypto.randomUUID();
  const text = typeof value.text === "string" ? value.text : "";
  const checked = value.checked === true;
  return { id, text, checked };
}

function repairChecklistBlock(value: Record<string, unknown>): ChecklistBlock | null {
  const id = typeof value.id === "string" ? value.id : crypto.randomUUID();
  const title = typeof value.title === "string" ? value.title : "Checklist";
  const rawItems = Array.isArray(value.items) ? value.items : [];
  const items = rawItems
    .filter((i) => typeof i === "object" && i !== null)
    .map((i) => repairChecklistItem(i as Record<string, unknown>));
  if (items.length === 0) items.push(repairChecklistItem({}));
  return { id, type: "checklist", title, items };
}

function repairHabitItem(value: Record<string, unknown> | string): HabitItem {
  if (typeof value === "string") {
    return { id: crypto.randomUUID(), name: value, done: false };
  }
  const id = typeof value.id === "string" ? value.id : crypto.randomUUID();
  const name = typeof value.name === "string" ? value.name : "";
  const done = value.done === true;
  return { id, name, done };
}

function repairHabitTrackerBlock(
  value: Record<string, unknown>
): HabitTrackerBlock | null {
  const id = typeof value.id === "string" ? value.id : crypto.randomUUID();
  const title = typeof value.title === "string" ? value.title : "This Week";
  const rawHabits = Array.isArray(value.habits) ? value.habits : [];
  const habits = rawHabits
    .filter((h) => typeof h === "string" || (typeof h === "object" && h !== null))
    .map((h) => repairHabitItem(typeof h === "string" ? h : (h as Record<string, unknown>)));
  if (habits.length === 0) {
    habits.push(
      ...["Exercise", "Read", "Meditate", "Journal"].map((name) => ({
        id: crypto.randomUUID(),
        name,
        done: false,
      }))
    );
  }
  return { id, type: "habit-tracker", title, habits };
}

/**
 * Validate and optionally repair a block. Returns a valid Block or null if unrepairable.
 */
export function validateBlock(value: unknown): Block | null {
  if (typeof value !== "object" || value === null) return null;
  const o = value as Record<string, unknown>;

  const id = o.id;
  const type = o.type;
  if (typeof id !== "string" || !isValidBlockType(type)) return null;

  switch (type) {
    case "text":
      if (isValidTextBlock(value)) return value;
      return repairTextBlock(o);
    case "checklist":
      if (isValidChecklistBlock(value)) return value;
      return repairChecklistBlock(o);
    case "habit-tracker":
      if (isValidHabitTrackerBlock(value)) return value;
      return repairHabitTrackerBlock(o);
    default:
      return null;
  }
}

/**
 * Validate and repair an array of blocks. Invalid blocks are repaired or filtered out.
 */
export function validateBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return [];
  const result: Block[] = [];
  for (const item of value) {
    const block = validateBlock(item);
    if (block) result.push(block);
  }
  return result;
}
