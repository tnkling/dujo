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
import {
  getTodayPageId,
  getPrevPageId,
  getNextPageId,
  formatPageIdForDisplay,
} from "@/lib/dates";
import { ViewSwitcher } from "@/components/ViewSwitcher";

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  "rapid-log": "Log",
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
  const addMenuRef = useRef<HTMLDivElement>(null);
  const pagesMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const todayId = getTodayPageId();
  const prevId = getPrevPageId(pageId);
  const nextId = getNextPageId(pageId);
  const isToday = pageId === todayId;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!addMenuOpen && !pagesMenuOpen && !accountMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        addMenuRef.current?.contains(t) ||
        pagesMenuRef.current?.contains(t) ||
        accountMenuRef.current?.contains(t)
      ) return;
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
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  const sortableItems = useMemo(() => blocks.map((b) => b.id), [blocks]);

  if (!mounted || !isHydrated) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="text-stone-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Top utility bar — minimal, stays out of the way */}
      <div className="border-b border-stone-200 bg-[var(--cream)]">
        <div className="max-w-2xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
          {/* Pages + auth */}
          <div className="flex items-center gap-1">
            <div ref={pagesMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setPagesMenuOpen((p) => !p)}
                className="px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors"
                aria-expanded={pagesMenuOpen}
              >
                Pages
              </button>
              {pagesMenuOpen && (
                <div className="absolute left-0 mt-1 py-2 rounded-lg border border-stone-200 bg-[var(--paper)] shadow-lg z-20">
                  <PageDiscovery
                    currentPageId={pageId}
                    onClose={() => setPagesMenuOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Add block */}
            <div ref={addMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setAddMenuOpen((p) => !p)}
                className="px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors"
                aria-expanded={addMenuOpen}
              >
                + Add
              </button>
              {addMenuOpen && (
                <div className="absolute left-0 mt-1 py-1 rounded-lg border border-stone-200 bg-[var(--paper)] shadow-lg z-20 min-w-[140px]">
                  {getRegisteredBlockTypes().map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddBlock(type)}
                      className="w-full px-4 py-1.5 text-left text-sm text-stone-700 hover:bg-stone-50"
                    >
                      {BLOCK_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side: view switcher + auth */}
          <div className="flex items-center gap-2">
            <ViewSwitcher view="day" currentId={pageId} />

            <div ref={accountMenuRef} className="relative">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((p) => !p)}
                    className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded truncate max-w-[120px]"
                  >
                    {user.email}
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-1 py-1 rounded-lg border border-stone-200 bg-[var(--paper)] shadow-lg z-20 min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => { void signOut(); setAccountMenuOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
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
                  className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded"
                >
                  {authLoading ? "…" : "Sign in"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Journal page */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Page header — centered like writing the date at the top of a notebook page */}
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Link
              href={`/page/${prevId}`}
              className="text-stone-400 hover:text-stone-700 transition-colors"
              aria-label="Previous day"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
              {pageTitle}
            </h1>
            <Link
              href={`/page/${nextId}`}
              className="text-stone-400 hover:text-stone-700 transition-colors"
              aria-label="Next day"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Thin rule under the date, like underlining the header in a notebook */}
          <div className="w-24 h-px bg-stone-300 mx-auto mt-3" />

          <div className="mt-2 flex items-center justify-center gap-3">
            {!isToday && (
              <Link
                href={`/page/${todayId}`}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
              >
                → Today
              </Link>
            )}
            {showSaved && (
              <span className="text-xs text-stone-400">Saved</span>
            )}
            <span className="text-xs text-stone-400">
              {user ? "synced" : "local"}
            </span>
          </div>
        </header>

        {/* Writing area — dot grid like a real bullet journal page */}
        <div className="dot-grid rounded-lg p-6 min-h-[60vh]" style={{ backgroundColor: "var(--paper)" }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <div key={block.id} className="space-y-2">
                    <InlineInsert onInsert={(type) => handleAddBlock(type, index)} />
                    <SortableBlock
                      block={block}
                      onBlockChange={handleBlockChange}
                      onDelete={handleDeleteBlock}
                    />
                  </div>
                ))}
                <InlineInsert onInsert={(type) => handleAddBlock(type)} />
              </div>
            </SortableContext>
          </DndContext>

          {blocks.length === 0 && (
            <p className="text-stone-300 text-sm text-center mt-8 select-none">
              Click "+ Add" above to start your log
            </p>
          )}
        </div>

        {/* BuJo key — small reference at the bottom */}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 justify-center">
          {[
            ["·", "Task"],
            ["×", "Done"],
            ["›", "Migrated"],
            ["○", "Event"],
            ["—", "Note"],
            ["★", "Priority"],
          ].map(([glyph, label]) => (
            <span key={label} className="text-xs text-stone-400 font-mono">
              {glyph} <span className="font-sans">{label}</span>
            </span>
          ))}
        </div>
      </div>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}

/** Hairline insert zone — barely visible until hovered */
function InlineInsert({ onInsert }: { onInsert: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center gap-2 group/ins -my-1 py-1">
      <div className="flex-1 h-px bg-stone-200 opacity-0 group-hover/ins:opacity-100 transition-opacity" />
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="text-stone-300 hover:text-stone-500 text-xs opacity-0 group-hover/ins:opacity-100 transition-opacity focus:opacity-100 leading-none"
        aria-label="Insert block"
      >
        +
      </button>
      <div className="flex-1 h-px bg-stone-200 opacity-0 group-hover/ins:opacity-100 transition-opacity" />
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 py-1 rounded-lg border border-stone-200 bg-[var(--paper)] shadow-lg z-10 min-w-[140px]">
          {getRegisteredBlockTypes().map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { onInsert(type); setOpen(false); }}
              className="w-full px-4 py-1.5 text-left text-sm text-stone-700 hover:bg-stone-50"
            >
              {BLOCK_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
