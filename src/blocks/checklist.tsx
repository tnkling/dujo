"use client";

import { memo } from "react";
import type { Block, ChecklistBlock as ChecklistBlockType } from "./types";
import { registerBlock } from "./registry";

function ChecklistBlockComponent({
  block,
  onBlockChange,
}: {
  block: ChecklistBlockType;
  onBlockChange: (updated: ChecklistBlockType) => void;
}) {
  return (
    <div className="p-4 rounded-lg border border-zinc-200 bg-white">
      <h3 className="font-medium text-zinc-800 mb-3">{block.title}</h3>
      <ul className="space-y-2">
        {block.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => {
                const items = block.items.map((i) =>
                  i.id === item.id ? { ...i, checked: !i.checked } : i
                );
                onBlockChange({ ...block, items });
              }}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-300"
            />
            <input
              type="text"
              value={item.text}
              onChange={(e) => {
                const items = block.items.map((i) =>
                  i.id === item.id ? { ...i, text: e.target.value } : i
                );
                onBlockChange({ ...block, items });
              }}
              className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-700 ${
                item.checked ? "line-through text-zinc-500" : ""
              }`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

const ChecklistBlock = memo(function ChecklistBlock(props: {
  block: Block;
  onBlockChange: (b: Block) => void;
}) {
  if (props.block.type !== "checklist") return null;
  return (
    <ChecklistBlockComponent
      block={props.block}
      onBlockChange={props.onBlockChange as (b: ChecklistBlockType) => void}
    />
  );
});

registerBlock({
  type: "checklist",
  component: ChecklistBlock,
  createDefault: (id) => ({
    id,
    type: "checklist",
    title: "Checklist",
    items: [{ id: `${id}-1`, text: "", checked: false }],
  }),
});

export { ChecklistBlock };
