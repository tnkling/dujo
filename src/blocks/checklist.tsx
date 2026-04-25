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
    <div className="py-1">
      {block.title && (
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2 ml-7">{block.title}</p>
      )}
      <ul className="space-y-0.5">
        {block.items.map((item) => (
          <li key={item.id} className="flex items-baseline gap-2">
            <button
              type="button"
              onClick={() => {
                const items = block.items.map((i) =>
                  i.id === item.id ? { ...i, checked: !i.checked } : i
                );
                onBlockChange({ ...block, items });
              }}
              className="flex-none w-5 text-center font-mono text-base leading-none text-stone-400 hover:text-stone-600 transition-colors"
            >
              {item.checked ? "×" : "·"}
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(e) => {
                const items = block.items.map((i) =>
                  i.id === item.id ? { ...i, text: e.target.value } : i
                );
                onBlockChange({ ...block, items });
              }}
              className={`flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 text-sm leading-relaxed min-w-0 ${
                item.checked ? "line-through text-stone-400" : "text-stone-800"
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
