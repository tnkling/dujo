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
    <div className="p-4 rounded-lg border border-zinc-200 bg-white">
      <h3 className="font-medium text-zinc-800 mb-3">{block.title}</h3>
      <ul className="space-y-2">
        {block.habits.map((habit) => (
          <li
            key={habit.id}
            className="flex items-center gap-3 group"
          >
            <input
              type="checkbox"
              checked={habit.done}
              onChange={() => handleToggle(habit.id)}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-300"
            />
            <span
              className={`flex-1 ${
                habit.done ? "line-through text-zinc-500" : "text-zinc-700"
              }`}
            >
              {habit.name}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveHabit(habit.id)}
              className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Remove ${habit.name}`}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddHabit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Add habit…"
          className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg"
        >
          Add
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
