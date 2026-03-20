"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Block } from "@/blocks";
import { validateBlocks } from "@/blocks";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchPageBlocks,
  savePageBlocks as saveToSupabase,
} from "@/lib/journal-sync";

const STORAGE_PREFIX = "dujo-page-";
const STORAGE_INDEX_KEY = "dujo-page-index";
const LEGACY_PAGES_KEY = "dujo-journal-pages";
const LEGACY_BLOCKS_KEY = "dujo-journal-blocks";
const BROADCAST_CHANNEL = "dujo-journal-sync";
const SAVE_DEBOUNCE_MS = 500;

export type PersistedPages = Record<string, Block[]>;

function pageKey(pageId: string) {
  return `${STORAGE_PREFIX}${pageId}`;
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window))
    return null;
  return new BroadcastChannel(BROADCAST_CHANNEL);
}

/** One-time migration from legacy storage to per-page keys */
function migrateFromLegacy(): void {
  if (typeof window === "undefined") return;
  try {
    const legacy = localStorage.getItem(LEGACY_BLOCKS_KEY);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        const blocks = validateBlocks(parsed);
        if (blocks.length > 0) {
          const today = new Date().toISOString().slice(0, 10);
          localStorage.setItem(pageKey(today), JSON.stringify(blocks));
          addToPageIndex(today);
        }
        localStorage.removeItem(LEGACY_BLOCKS_KEY);
      } catch {
        localStorage.removeItem(LEGACY_BLOCKS_KEY);
      }
    }

    const allRaw = localStorage.getItem(LEGACY_PAGES_KEY);
    if (allRaw) {
      try {
        const parsed = JSON.parse(allRaw);
        if (typeof parsed === "object" && parsed !== null) {
          for (const [id, value] of Object.entries(parsed)) {
            if (typeof id === "string") {
              const blocks = validateBlocks(value);
              if (blocks.length > 0) {
                localStorage.setItem(pageKey(id), JSON.stringify(blocks));
                addToPageIndex(id);
              }
            }
          }
          localStorage.removeItem(LEGACY_PAGES_KEY);
        }
      } catch {
        localStorage.removeItem(LEGACY_PAGES_KEY);
      }
    }
  } catch {
    // Ignore
  }
}

function addToPageIndex(pageId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_INDEX_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(pageId)) {
      ids.push(pageId);
      localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(ids));
    }
  } catch {
    // Ignore
  }
}

function loadPageBlocksFromLocal(pageId: string): Block[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(pageKey(pageId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validateBlocks(parsed);
  } catch {
    return null;
  }
}

function savePageBlocksToLocal(pageId: string, blocks: Block[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(pageKey(pageId), JSON.stringify(blocks));
    addToPageIndex(pageId);
    getChannel()?.postMessage({ type: "saved", pageId });
  } catch {
    // Ignore
  }
}

/** Get fallback blocks: mock data for today, empty for other dates (client timezone) */
function getFallbackBlocks(pageId: string, todayFallback: Block[]): Block[] {
  if (typeof window === "undefined") return todayFallback;
  const today = new Date().toISOString().slice(0, 10);
  return pageId === today ? todayFallback : [];
}

export function usePersistedBlocks(
  pageId: string,
  todayFallbackBlocks: Block[]
) {
  const { user } = useAuth();
  const fallback = getFallbackBlocks(pageId, todayFallbackBlocks);
  const [blocks, setBlocksState] = useState<Block[]>(fallback);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const hasMigrated = useRef(false);

  // One-time migration on mount
  useEffect(() => {
    if (!hasMigrated.current) {
      migrateFromLegacy();
      hasMigrated.current = true;
    }
  }, []);

  // Reset when pageId or user changes
  useEffect(() => {
    setIsHydrated(false);
    setBlocksState(getFallbackBlocks(pageId, todayFallbackBlocks));
  }, [pageId, todayFallbackBlocks, user?.id]);

  // Load when pageId changes: Supabase if logged in, else localStorage
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const fallbackBlocks = getFallbackBlocks(pageId, todayFallbackBlocks);

      if (user?.id) {
        const remote = await fetchPageBlocks(user.id, pageId);
        if (!cancelled) {
          setBlocksState(remote ?? fallbackBlocks);
          // Cache in localStorage for offline
          if (remote) savePageBlocksToLocal(pageId, remote);
        }
      } else {
        const local = loadPageBlocksFromLocal(pageId);
        if (!cancelled) {
          setBlocksState(local ?? fallbackBlocks);
        }
      }

      if (!cancelled) setIsHydrated(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [pageId, todayFallbackBlocks, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for saves from other tabs
  useEffect(() => {
    const channel = getChannel();
    if (!channel) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "saved" && e.data?.pageId === pageId) {
        const stored = loadPageBlocksFromLocal(pageId);
        if (stored) setBlocksState(stored);
      }
    };
    channel.addEventListener("message", handler);
    return () => channel.removeEventListener("message", handler);
  }, [pageId]);

  // Debounced save
  useEffect(() => {
    if (!isHydrated) return;

    const timer = setTimeout(async () => {
      if (user?.id) {
        const ok = await saveToSupabase(user.id, pageId, blocks);
        if (ok) setLastSavedAt(Date.now());
        // Also cache locally for offline
        savePageBlocksToLocal(pageId, blocks);
      } else {
        savePageBlocksToLocal(pageId, blocks);
        setLastSavedAt(Date.now());
      }
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [blocks, isHydrated, pageId, user?.id]);

  useEffect(() => {
    if (!lastSavedAt) return;
    const timer = setTimeout(() => setLastSavedAt(null), 2000);
    return () => clearTimeout(timer);
  }, [lastSavedAt]);

  const setBlocks = useCallback(
    (updater: Block[] | ((prev: Block[]) => Block[])) => {
      setBlocksState(updater);
    },
    []
  );

  return [blocks, setBlocks, isHydrated, lastSavedAt] as const;
}
