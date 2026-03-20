"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Block, BlockType } from "@/blocks";
import { createBlock, getRegisteredBlockTypes } from "@/blocks";
import { SortableBlock } from "@/components/blocks/SortableBlock";
import { usePersistedBlocks } from "@/hooks/usePersistedBlocks";
import { useAuth } from "@/contexts/AuthContext";
import { PageDiscovery } from "./PageDiscovery";
import { AuthModal } from "@/components/auth/AuthModal";
import { InsertBlockButton } from "./InsertBlockButton";
import { AddBlockDropdown } from "./AddBlockDropdown";
import {
  getTodayPageId,
  getPrevPageId,
  getNextPageId,
} from "@/lib/dates";

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  text: "Text",
  checklist: "Checklist",
  "habit-tracker": "Habit Tracker",
};

interface JournalPageProps {
  pageId: string;
  todayFallbackBlocks: Block[];
  pageTitle: string;
}

export function JournalPage({
  pageId,
  todayFallbackBlocks,
  pageTitle,
}: JournalPageProps) {
  const [blocks, setBlocks, isHydrated, lastSavedAt] = usePersistedBlocks(
    pageId,
    todayFallbackBlocks
  );

  const showSaved = lastSavedAt !== null;
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [pagesMenuOpen, setPagesMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [addMenuFocusIndex, setAddMenuFocusIndex] = useState(0);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const addMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const pagesMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const todayId = getTodayPageId();
  const prevId = getPrevPageId(pageId);
  const nextId = getNextPageId(pageId);
  const isToday = pageId === todayId;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!addMenuOpen && !pagesMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        addMenuRef.current?.contains(target) ||
        pagesMenuRef.current?.contains(target) ||
        accountMenuRef.current?.contains(target)
      )
        return;
      setAddMenuOpen(false);
      setPagesMenuOpen(false);
      setAccountMenuOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAddMenuOpen(false);
        setPagesMenuOpen(false);
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [addMenuOpen, pagesMenuOpen, accountMenuOpen]);

  const handleAddBlock = useCallback((type: BlockType, atIndex?: number) => {
    const newBlock = createBlock(type, crypto.randomUUID());
    setBlocks((prev) => {
      const index = atIndex ?? prev.length;
      const next = [...prev];
      next.splice(index, 0, newBlock);
      return next;
    });
    setAddMenuOpen(false);
  }, []);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleBlockChange = useCallback((updatedBlock: Block) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
    );
  }, []);

  const sortableItems = useMemo(
    () => blocks.map((b) => b.id),
    [blocks]
  );

  if (!mounted || !isHydrated) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-800">{pageTitle}</h1>
          <p className="text-zinc-500 mt-1">Loading...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <header className="mb-8 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2">
            <Link
              href={`/page/${prevId}`}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Previous day"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-zinc-800 min-w-[180px] text-center">
              {pageTitle}
            </h1>
            <Link
              href={`/page/${nextId}`}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Next day"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <div ref={accountMenuRef} className="relative">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                    className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg truncate max-w-[140px]"
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="true"
                  >
                    {user.email}
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 py-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-20 min-w-[180px]">
                      <button
                        type="button"
                        onClick={() => {
                          void signOut();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  disabled={authLoading}
                  className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg"
                >
                  {authLoading ? "Loading…" : "Sign in"}
                </button>
              )}
            </div>
            {!isToday && (
              <Link
                href={`/page/${todayId}`}
                className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg"
              >
                Today
              </Link>
            )}
            <div ref={pagesMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setPagesMenuOpen((prev) => !prev)}
                className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg flex items-center gap-1"
                aria-expanded={pagesMenuOpen}
                aria-haspopup="true"
              >
                Pages
                <svg
                  className={`w-4 h-4 transition-transform ${pagesMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {pagesMenuOpen && (
                <div className="absolute right-0 mt-2 py-2 rounded-lg border border-zinc-200 bg-white shadow-lg z-20">
                  <PageDiscovery
                    currentPageId={pageId}
                    onClose={() => setPagesMenuOpen(false)}
                  />
                </div>
              )}
            </div>
            <div ref={addMenuRef} className="relative">
              <button
                ref={addMenuTriggerRef}
                type="button"
                onClick={() => {
                  setAddMenuOpen((prev) => !prev);
                  setAddMenuFocusIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setAddMenuOpen((prev) => !prev);
                    setAddMenuFocusIndex(0);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 text-sm font-medium hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                aria-expanded={addMenuOpen}
                aria-haspopup="true"
              >
                Add Block
                <svg
                  className={`w-4 h-4 transition-transform ${
                    addMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {addMenuOpen && (
                <AddBlockDropdown
                  blockTypes={getRegisteredBlockTypes()}
                  labels={BLOCK_TYPE_LABELS}
                  focusIndex={addMenuFocusIndex}
                  onFocusIndexChange={setAddMenuFocusIndex}
                  onSelect={(type) => handleAddBlock(type)}
                  onClose={() => {
                    setAddMenuOpen(false);
                    addMenuTriggerRef.current?.focus();
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <p className="text-zinc-500 text-sm flex items-center gap-2 flex-wrap">
          Drag blocks to reorder • Edit inline •
          {user ? "Synced across devices" : "Saved locally"}
          {showSaved && (
            <span className="text-emerald-600 text-xs font-medium">Saved</span>
          )}
        </p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableItems}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="space-y-4">
                <InsertBlockButton
                  onInsert={(type) => handleAddBlock(type, index)}
                  aria-label={`Add block above ${index + 1}`}
                />
                <SortableBlock
                  block={block}
                  onBlockChange={handleBlockChange}
                  onDelete={handleDeleteBlock}
                />
              </div>
            ))}
            <InsertBlockButton
              onInsert={(type) => handleAddBlock(type)}
              aria-label="Add block at end"
            />
          </div>
        </SortableContext>
      </DndContext>
      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      )}
    </div>
  );
}
