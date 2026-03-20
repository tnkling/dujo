"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPageIds } from "@/lib/journal-sync";

const STORAGE_INDEX_KEY = "dujo-page-index";

function getLocalPageIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_INDEX_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return [...new Set(ids)].sort().reverse();
  } catch {
    return [];
  }
}

export function usePersistedPageIds(): {
  pageIds: string[];
  refresh: () => Promise<void>;
} {
  const { user } = useAuth();
  const [pageIds, setPageIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (user?.id) {
      const ids = await fetchPageIds(user.id);
      setPageIds(ids);
    } else {
      setPageIds(getLocalPageIds());
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { pageIds, refresh };
}
