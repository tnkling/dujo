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
      className={`group ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-4 flex flex-col gap-1">
          <button
            {...attributes}
            {...listeners}
            className="p-2 rounded cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 touch-none"
            aria-label="Drag to reorder"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 8 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="2" cy="3" r="1" />
              <circle cx="6" cy="3" r="1" />
              <circle cx="2" cy="8" r="1" />
              <circle cx="6" cy="8" r="1" />
              <circle cx="2" cy="13" r="1" />
              <circle cx="6" cy="13" r="1" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="p-2 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 opacity-40 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-200 transition-opacity"
            aria-label="Delete block"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <BlockRenderer block={block} onBlockChange={onBlockChange} />
        </div>
      </div>
    </div>
  );
});
