"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "@/blocks";
import { BlockRenderer } from "@/blocks";

interface SortableBlockProps {
  block: Block;
  onBlockChange: (updatedBlock: Block) => void;
  onDelete: (blockId: string) => void;
}

export const SortableBlock = memo(function SortableBlock({
  block,
  onBlockChange,
  onDelete,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/block relative ${isDragging ? "opacity-40" : ""}`}
    >
      {/* Drag handle — only visible on hover, floats to the left */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/block:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none p-1"
        aria-label="Drag to reorder"
      >
        <svg className="w-3 h-3 text-stone-300" fill="currentColor" viewBox="0 0 8 16">
          <circle cx="2" cy="3" r="1" />
          <circle cx="6" cy="3" r="1" />
          <circle cx="2" cy="8" r="1" />
          <circle cx="6" cy="8" r="1" />
          <circle cx="2" cy="13" r="1" />
          <circle cx="6" cy="13" r="1" />
        </svg>
      </div>

      {/* Delete — tiny × that floats top-right on hover */}
      <button
        type="button"
        onClick={() => onDelete(block.id)}
        className="absolute -right-5 top-0 opacity-0 group-hover/block:opacity-100 transition-opacity text-stone-300 hover:text-red-400 text-xs leading-none p-1 focus:opacity-100 focus:outline-none"
        aria-label="Delete block"
      >
        ×
      </button>

      <BlockRenderer block={block} onBlockChange={onBlockChange} />
    </div>
  );
});
