"use client";

import { useEffect, useRef } from "react";
import type { BlockType } from "@/blocks";

interface AddBlockDropdownProps {
  blockTypes: BlockType[];
  labels: Record<BlockType, string>;
  focusIndex: number;
  onFocusIndexChange: (index: number) => void;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export function AddBlockDropdown({
  blockTypes,
  labels,
  focusIndex,
  onFocusIndexChange,
  onSelect,
  onClose,
}: AddBlockDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    buttonRefs.current[focusIndex]?.focus();
  }, [focusIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        onFocusIndexChange(
          focusIndex < blockTypes.length - 1 ? focusIndex + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        onFocusIndexChange(
          focusIndex > 0 ? focusIndex - 1 : blockTypes.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        onSelect(blockTypes[focusIndex]);
        onClose();
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute right-0 mt-2 w-48 py-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10"
      role="menu"
      onKeyDown={handleKeyDown}
    >
      {blockTypes.map((type, index) => (
        <button
          key={type}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }}
          type="button"
          role="menuitem"
          tabIndex={index === focusIndex ? 0 : -1}
          onClick={() => {
            onSelect(type);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none"
        >
          {labels[type]}
        </button>
      ))}
    </div>
  );
}
