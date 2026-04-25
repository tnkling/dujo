"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import type { Block, TextBlock as TextBlockType } from "./types";
import { registerBlock } from "./registry";

const DEBOUNCE_MS = 300;

function TextBlockComponent({
  block,
  onBlockChange,
}: {
  block: TextBlockType;
  onBlockChange: (updated: TextBlockType) => void;
}) {
  const [localContent, setLocalContent] = useState(block.content);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from prop when switching to a different block (by id)
  useEffect(() => {
    setLocalContent(block.content);
  }, [block.id]);

  const flush = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    onBlockChange({ ...block, content: localContent });
  }, [block, localContent, onBlockChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLocalContent(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        onBlockChange({ ...block, content: value });
      }, DEBOUNCE_MS);
    },
    [block, onBlockChange]
  );

  return (
    <textarea
      value={localContent}
      onChange={handleChange}
      onBlur={flush}
      className="w-full min-h-[80px] bg-transparent border-none outline-none ring-0 focus:ring-0 text-stone-700 placeholder-stone-300 resize-none text-sm leading-relaxed"
      placeholder="Write your thoughts…"
    />
  );
}

const TextBlock = memo(function TextBlock(props: {
  block: Block;
  onBlockChange: (b: Block) => void;
}) {
  if (props.block.type !== "text") return null;
  return (
    <TextBlockComponent
      block={props.block}
      onBlockChange={props.onBlockChange as (b: TextBlockType) => void}
    />
  );
});

registerBlock({
  type: "text",
  component: TextBlock,
  createDefault: (id) => ({ id, type: "text", content: "" }),
});

export { TextBlock };
