"use client";

import { memo } from "react";
import type { Block, HabitTrackerBlock as HabitTrackerBlockType } from "./types";
import { registerBlock } from "./registry";

function HabitTrackerBlockComponent({ block }: { block: HabitTrackerBlockType }) {
  return (
    <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50 border-dashed">
      <h3 className="font-medium text-zinc-700 mb-3">{block.title}</h3>
      <div className="flex flex-wrap gap-2">
        {block.habits.map((habit, index) => (
          <span
            key={index}
            className="px-3 py-1.5 rounded-md bg-white border border-zinc-200 text-sm text-zinc-600"
          >
            {habit}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm text-zinc-500">Habit tracker — coming soon</p>
    </div>
  );
}

const HabitTrackerBlock = memo(function HabitTrackerBlock(props: {
  block: Block;
  onBlockChange: (b: Block) => void;
}) {
  if (props.block.type !== "habit-tracker") return null;
  return <HabitTrackerBlockComponent block={props.block} />;
});

registerBlock({
  type: "habit-tracker",
  component: HabitTrackerBlock,
  createDefault: (id) => ({
    id,
    type: "habit-tracker",
    title: "This Week",
    habits: ["Exercise", "Read", "Meditate", "Journal"],
  }),
});

export { HabitTrackerBlock };
