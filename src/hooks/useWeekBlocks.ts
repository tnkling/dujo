"use client";

import { useState, useEffect } from "react";
import type { Block } from "@/blocks";
import { validateBlocks } from "@/blocks";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMultiplePageBlocks } from "@/lib/journal-sync";

const STORAGE_PREFIX = "dujo-page-";

function loadLocal(pageId: string): Block[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${pageId}`);
    if (!raw) return [];
    return validateBlocks(JSON.parse(raw)) ?? [];
  } catch {
    return [];
  }
}

export function useWeekBlocks(pageIds: string[]): {
  blocksByDay: Record<string, Block[]>;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const [blocksByDay, setBlocksByDay] = useState<Record<string, Block[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const key = pageIds.join(",");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function load() {
      if (user?.id) {
        const remote = await fetchMultiplePageBlocks(user.id, pageIds);
        if (!cancelled) {
          setBlocksByDay(remote);
          setIsLoading(false);
        }
      } else {
        const local: Record<string, Block[]> = {};
        for (const id of pageIds) {
          const blocks = loadLocal(id);
          if (blocks.length > 0) local[id] = blocks;
        }
        if (!cancelled) {
          setBlocksByDay(local);
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, user?.id]);

  return { blocksByDay, isLoading };
}
