"use client";

import { useState, useCallback } from "react";
import { memo } from "react";
import type { Block, HabitTrackerBlock as HabitTrackerBlockType } from "./types";
import { registerBlock } from "./registry";

function HabitTrackerBlockComponent({
  block,
  onBlockChange,
}: {
  block: HabitTrackerBlockType;
  onBlockChange: (updated: HabitTrackerBlockType) => void;
}) {
  const [newHabit, setNewHabit] = useState("");

  const handleToggle = useCallback(
    (habitId: string) => {
      const habits = block.habits.map((h) =>
        h.id === habitId ? { ...h, done: !h.done } : h
      );
      onBlockChange({ ...block, habits });
    },
    [block, onBlockChange]
  );

  const handleAddHabit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const name = newHabit.trim();
      if (!name) return;
      const habits = [
        ...block.habits,
        { id: crypto.randomUUID(), name, done: false },
      ];
      onBlockChange({ ...block, habits });
      setNewHabit("");
    },
    [block, newHabit, onBlockChange]
  );

  const handleRemoveHabit = useCallback(
    (habitId: string) => {
      const habits = block.habits.filter((h) => h.id !== habitId);
      onBlockChange({ ...block, habits });
    },
    [block, onBlockChange]
  );

  return (
    <div className="py-1">
      {block.title && (
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2 ml-7">{block.title}</p>
      )}
      <ul className="space-y-0.5">
        {block.habits.map((habit) => (
          <li key={habit.id} className="flex items-baseline gap-2 group/habit">
            <button
              type="button"
              onClick={() => handleToggle(habit.id)}
              className="flex-none w-5 text-center font-mono text-base leading-none text-stone-400 hover:text-stone-600 transition-colors"
            >
              {habit.done ? "×" : "○"}
            </button>
            <span className={`flex-1 text-sm leading-relaxed ${habit.done ? "line-through text-stone-400" : "text-stone-700"}`}>
              {habit.name}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveHabit(habit.id)}
              className="opacity-0 group-hover/habit:opacity-100 text-stone-300 hover:text-red-400 text-xs transition-opacity"
              aria-label={`Remove ${habit.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddHabit} className="mt-2 ml-7 flex gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Add habit…"
          className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 text-sm text-stone-700 placeholder-stone-300"
        />
        <button
          type="submit"
          className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
        >
          add
        </button>
      </form>
    </div>
  );
}

const HabitTrackerBlock = memo(function HabitTrackerBlock(props: {
  block: Block;
  onBlockChange: (b: Block) => void;
}) {
  if (props.block.type !== "habit-tracker") return null;
  return (
    <HabitTrackerBlockComponent
      block={props.block}
      onBlockChange={props.onBlockChange as (b: HabitTrackerBlockType) => void}
    />
  );
});

registerBlock({
  type: "habit-tracker",
  component: HabitTrackerBlock,
  createDefault: (id) => ({
    id,
    type: "habit-tracker",
    title: "Today",
    habits: [
      { id: crypto.randomUUID(), name: "Exercise", done: false },
      { id: crypto.randomUUID(), name: "Read", done: false },
      { id: crypto.randomUUID(), name: "Meditate", done: false },
      { id: crypto.randomUUID(), name: "Journal", done: false },
    ],
  }),
});

export { HabitTrackerBlock };
