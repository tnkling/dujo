/**
 * Block system — extensible block registry for the journal editor.
 *
 * To add a new block type:
 * 1. Add the type and interface to types.ts
 * 2. Create a new file (e.g. my-block.tsx) with component + registerBlock()
 * 3. Import it here to trigger registration
 */

import "./rapid-log";
import "./text";
import "./checklist";
import "./habit-tracker";

export {
  BlockRenderer,
  registerBlock,
  createBlock,
  isBlockTypeRegistered,
  getRegisteredBlockTypes,
} from "./registry";

export { validateBlock, validateBlocks } from "./validation";

export type {
  Block,
  BlockType,
  BlockComponentProps,
  RapidLogBlock,
  RapidEntry,
  BulletType,
  TaskStatus,
  TextBlock,
  ChecklistBlock,
  HabitTrackerBlock,
  ChecklistItem,
  HabitItem,
} from "./types";
