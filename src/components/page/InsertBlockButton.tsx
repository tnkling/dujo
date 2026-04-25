"use client";

import { useState, useRef, useEffect } from "react";
import type { BlockType } from "@/blocks";
import { getRegisteredBlockTypes } from "@/blocks";

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  "rapid-log": "Log",
  text: "Text",
  checklist: "Checklist",
  "habit-tracker": "Habit Tracker",
};

interface InsertBlockButtonProps {
  onInsert: (type: BlockType) => void;
  "aria-label"?: string;
}

export function InsertBlockButton({ onInsert, "aria-label": ariaLabel }: InsertBlockButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-center -my-2 py-2 group/insert">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full opacity-0 group-hover/insert:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        aria-label={ariaLabel ?? "Insert block"}
        aria-expanded={open}
        aria-haspopup="true"
      >
        + Add block
      </button>
      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 py-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 min-w-[140px]"
          role="menu"
        >
          {getRegisteredBlockTypes().map((type) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              onClick={() => {
                onInsert(type);
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
            >
              {BLOCK_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
