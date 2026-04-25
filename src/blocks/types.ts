// Block type discriminator — add new types here when extending
export type BlockType = "rapid-log" | "text" | "checklist" | "habit-tracker";

// Checklist item
export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

// Habit item (one habit + done state for current day)
export interface HabitItem {
  id: string;
  name: string;
  done: boolean;
}

// Rapid log — the core bullet journal entry type
export type BulletType = "task" | "event" | "note" | "priority";
export type TaskStatus = "pending" | "complete" | "migrated" | "cancelled";

export interface RapidEntry {
  id: string;
  bullet: BulletType;
  status: TaskStatus;
  text: string;
}

// Base block with shared fields
interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface RapidLogBlock extends BaseBlock {
  type: "rapid-log";
  entries: RapidEntry[];
}

// Block variants — add new interfaces here when extending
export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
}

export interface ChecklistBlock extends BaseBlock {
  type: "checklist";
  title: string;
  items: ChecklistItem[];
}

export interface HabitTrackerBlock extends BaseBlock {
  type: "habit-tracker";
  title: string;
  habits: HabitItem[];
}

// Union type — add new variants here when extending
export type Block = RapidLogBlock | TextBlock | ChecklistBlock | HabitTrackerBlock;

// Standard props for all block components
export interface BlockComponentProps {
  block: Block;
  onBlockChange: (updatedBlock: Block) => void;
}

import type { ComponentType } from "react";

// Block registry entry (component + optional default factory)
export interface BlockRegistryEntry {
  component: ComponentType<BlockComponentProps>;
  createDefault?: (id: string) => Block;
}
