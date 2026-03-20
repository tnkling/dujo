"use client";

import { memo } from "react";
import type {
  Block,
  BlockType,
  BlockRegistryEntry,
  BlockComponentProps,
} from "./types";

const blockRegistry: Partial<Record<BlockType, BlockRegistryEntry>> = {};

/**
 * Register a block type. Call this when defining a new block.
 *
 * @example
 * registerBlock({
 *   type: "text",
 *   component: TextBlock,
 *   createDefault: (id) => ({ id, type: "text", content: "" }),
 * });
 */
export function registerBlock<T extends Block>(config: {
  type: T["type"];
  component: BlockRegistryEntry["component"];
  createDefault?: (id: string) => T;
}) {
  blockRegistry[config.type] = {
    component: config.component,
    createDefault: config.createDefault as BlockRegistryEntry["createDefault"],
  };
}

/**
 * Create a new block with default data. Use when adding blocks dynamically.
 */
export function createBlock(type: BlockType, id: string): Block {
  const entry = blockRegistry[type];
  if (!entry?.createDefault) {
    throw new Error(`No default factory registered for block type "${type}"`);
  }
  return entry.createDefault(id);
}

/**
 * Check if a block type is registered (has a component).
 */
export function isBlockTypeRegistered(type: string): type is BlockType {
  return type in blockRegistry;
}

/**
 * Get all registered block types. Useful for block picker UI.
 */
export function getRegisteredBlockTypes(): BlockType[] {
  return Object.keys(blockRegistry) as BlockType[];
}

interface BlockRendererProps {
  block: Block;
  onBlockChange: (updatedBlock: Block) => void;
}

/**
 * Renders the appropriate block component based on block.type.
 * Uses the registry — no switch statement needed.
 */
export const BlockRenderer = memo(function BlockRenderer({
  block,
  onBlockChange,
}: BlockRendererProps) {
  const entry = blockRegistry[block.type];
  if (!entry) return null;

  const Component = entry.component;
  return (
    <Component block={block} onBlockChange={onBlockChange} />
  );
});
