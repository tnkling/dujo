"use client";

import { useRef, useCallback, memo } from "react";
import type { Block, RapidLogBlock as RapidLogBlockType, RapidEntry, BulletType, TaskStatus } from "./types";
import { registerBlock } from "./registry";

// ── Bullet state machine ───────────────────────────────────────────────────

// Full cycle order when clicking the bullet symbol
const CYCLE: Array<{ bullet: BulletType; status: TaskStatus }> = [
  { bullet: "task",     status: "pending"  },
  { bullet: "task",     status: "complete" },
  { bullet: "task",     status: "migrated" },
  { bullet: "event",    status: "pending"  },
  { bullet: "note",     status: "pending"  },
  { bullet: "priority", status: "pending"  },
];

function nextState(entry: RapidEntry): Pick<RapidEntry, "bullet" | "status"> {
  const idx = CYCLE.findIndex(s => s.bullet === entry.bullet && s.status === entry.status);
  return CYCLE[(idx + 1) % CYCLE.length];
}

// The glyph shown for each state — faithful to the BuJo key
const GLYPHS: Record<string, string> = {
  "task:pending":   "·",
  "task:complete":  "×",
  "task:migrated":  "›",
  "task:cancelled": "⊘",
  "event:pending":  "○",
  "note:pending":   "—",
  "priority:pending": "★",
};

function getGlyph(entry: RapidEntry): string {
  return GLYPHS[`${entry.bullet}:${entry.status}`] ?? "·";
}

// ── Entry styling ──────────────────────────────────────────────────────────

function glyphColor(entry: RapidEntry): string {
  if (entry.bullet === "priority") return "text-amber-700";
  if (entry.bullet === "event")    return "text-stone-500";
  if (entry.bullet === "note")     return "text-stone-400";
  if (entry.status === "complete") return "text-stone-400";
  if (entry.status === "migrated") return "text-stone-400";
  return "text-stone-500";
}

function textStyle(entry: RapidEntry): string {
  if (entry.status === "complete") return "line-through text-stone-400";
  if (entry.status === "migrated") return "text-stone-400 italic";
  if (entry.bullet === "note")     return "text-stone-500 italic";
  if (entry.bullet === "priority") return "font-medium text-stone-900";
  if (entry.bullet === "event")    return "text-stone-700";
  return "text-stone-800";
}

// ── Entry row ──────────────────────────────────────────────────────────────

interface EntryRowProps {
  entry: RapidEntry;
  inputRef: (el: HTMLInputElement | null) => void;
  onCycle: () => void;
  onChange: (text: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onFocusPrev: () => void;
  onFocusNext: () => void;
}

const EntryRow = memo(function EntryRow({
  entry,
  inputRef,
  onCycle,
  onChange,
  onEnter,
  onBackspaceEmpty,
  onFocusPrev,
  onFocusNext,
}: EntryRowProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    } else if (e.key === "Backspace" && entry.text === "") {
      e.preventDefault();
      onBackspaceEmpty();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onFocusPrev();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onFocusNext();
    }
  }, [entry.text, onEnter, onBackspaceEmpty, onFocusPrev, onFocusNext]);

  return (
    <div className="flex items-baseline gap-2 group/entry py-0.5">
      <button
        type="button"
        onClick={onCycle}
        title="Click to change state"
        className={`flex-none w-5 text-center font-mono text-base leading-none select-none cursor-pointer hover:scale-125 transition-transform ${glyphColor(entry)}`}
        tabIndex={-1}
      >
        {getGlyph(entry)}
      </button>
      <input
        ref={inputRef}
        type="text"
        value={entry.text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="…"
        className={`flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 placeholder-stone-300 text-sm leading-relaxed min-w-0 ${textStyle(entry)}`}
      />
    </div>
  );
});

// ── Block component ────────────────────────────────────────────────────────

function RapidLogBlockComponent({
  block,
  onBlockChange,
}: {
  block: RapidLogBlockType;
  onBlockChange: (updated: RapidLogBlockType) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateEntry = useCallback((idx: number, updates: Partial<RapidEntry>) => {
    const entries = block.entries.map((e, i) => i === idx ? { ...e, ...updates } : e);
    onBlockChange({ ...block, entries });
  }, [block, onBlockChange]);

  const addEntryAfter = useCallback((idx: number) => {
    const ref = block.entries[idx];
    const newEntry: RapidEntry = {
      id: crypto.randomUUID(),
      bullet: ref?.bullet ?? "task",
      status: "pending",
      text: "",
    };
    const entries = [...block.entries];
    entries.splice(idx + 1, 0, newEntry);
    onBlockChange({ ...block, entries });
    setTimeout(() => inputRefs.current[idx + 1]?.focus(), 0);
  }, [block, onBlockChange]);

  const removeEntry = useCallback((idx: number) => {
    if (block.entries.length <= 1) {
      updateEntry(0, { text: "" });
      return;
    }
    const entries = block.entries.filter((_, i) => i !== idx);
    onBlockChange({ ...block, entries });
    setTimeout(() => inputRefs.current[Math.max(0, idx - 1)]?.focus(), 0);
  }, [block, onBlockChange, updateEntry]);

  const cycleEntry = useCallback((idx: number) => {
    const entry = block.entries[idx];
    updateEntry(idx, nextState(entry));
  }, [block.entries, updateEntry]);

  return (
    <div className="py-1">
      {block.entries.map((entry, idx) => (
        <EntryRow
          key={entry.id}
          entry={entry}
          inputRef={(el) => { inputRefs.current[idx] = el; }}
          onCycle={() => cycleEntry(idx)}
          onChange={(text) => updateEntry(idx, { text })}
          onEnter={() => addEntryAfter(idx)}
          onBackspaceEmpty={() => removeEntry(idx)}
          onFocusPrev={() => inputRefs.current[idx - 1]?.focus()}
          onFocusNext={() => inputRefs.current[idx + 1]?.focus()}
        />
      ))}
    </div>
  );
}

const RapidLogBlock = memo(function RapidLogBlock(props: {
  block: Block;
  onBlockChange: (b: Block) => void;
}) {
  if (props.block.type !== "rapid-log") return null;
  return (
    <RapidLogBlockComponent
      block={props.block}
      onBlockChange={props.onBlockChange as (b: RapidLogBlockType) => void}
    />
  );
});

registerBlock({
  type: "rapid-log",
  component: RapidLogBlock,
  createDefault: (id) => ({
    id,
    type: "rapid-log",
    entries: [{ id: crypto.randomUUID(), bullet: "task", status: "pending", text: "" }],
  }),
});

export { RapidLogBlock };
