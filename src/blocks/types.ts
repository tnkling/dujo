// Block type discriminator — add new types here when extending
export type BlockType = "text" | "checklist" | "habit-tracker";

// Checklist item
export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

// Base block with shared fields
interface BaseBlock {
  id: string;
  type: BlockType;
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
  habits: string[];
}

// Union type — add new variants here when extending
export type Block = TextBlock | ChecklistBlock | HabitTrackerBlock;

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
