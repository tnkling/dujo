"use client";

import Link from "next/link";
import type { Block } from "@/blocks";
import type { ChecklistBlock, HabitTrackerBlock, TextBlock } from "@/blocks/types";
import { useWeekBlocks } from "@/hooks/useWeekBlocks";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import {
  getWeekDays,
  getPrevWeekId,
  getNextWeekId,
  getTodayPageId,
  getTodayWeekId,
  formatWeekIdForDisplay,
  parsePageId,
} from "@/lib/dates";

interface WeekViewProps {
  weekId: string;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CompactBlock({ block }: { block: Block }) {
  if (block.type === "text") {
    const b = block as TextBlock;
    const lines = b.content.split("\n").filter(Boolean);
    if (lines.length === 0) return null;
    return (
      <div className="text-xs text-stone-600 leading-relaxed">
        {lines.slice(0, 4).map((line, i) => (
          <p key={i} className="truncate">{line}</p>
        ))}
        {lines.length > 4 && <p className="text-stone-400">+{lines.length - 4} more</p>}
      </div>
    );
  }

  if (block.type === "checklist") {
    const b = block as ChecklistBlock;
    return (
      <div className="text-xs text-stone-600 space-y-0.5">
        {b.title && <p className="font-medium text-stone-700 truncate">{b.title}</p>}
        {b.items.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-start gap-1">
            <span className={item.checked ? "text-emerald-500" : "text-stone-400"}>
              {item.checked ? "✓" : "○"}
            </span>
            <span className={`truncate ${item.checked ? "line-through text-stone-400" : ""}`}>
              {item.text}
            </span>
          </div>
        ))}
        {b.items.length > 5 && (
          <p className="text-stone-400">+{b.items.length - 5} more</p>
        )}
      </div>
    );
  }

  if (block.type === "habit-tracker") {
    const b = block as HabitTrackerBlock;
    const done = b.habits.filter((h) => h.done).length;
    return (
      <div className="text-xs text-stone-600 space-y-0.5">
        {b.title && <p className="font-medium text-stone-700 truncate">{b.title}</p>}
        <p className="text-stone-500">{done}/{b.habits.length} habits</p>
        {b.habits.slice(0, 4).map((h) => (
          <div key={h.id} className="flex items-center gap-1">
            <span className={h.done ? "text-emerald-500" : "text-stone-400"}>
              {h.done ? "✓" : "○"}
            </span>
            <span className={`truncate ${h.done ? "text-stone-400" : ""}`}>{h.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function DayColumn({ pageId, blocks, isToday }: { pageId: string; blocks: Block[]; isToday: boolean }) {
  const date = parsePageId(pageId);
  const dayIndex = date ? ((date.getUTCDay() + 6) % 7) : 0;
  const dayName = DAY_NAMES[dayIndex];
  const dayNum = date ? date.getUTCDate() : "";

  return (
    <div className={`flex flex-col min-w-0 border rounded-xl p-3 ${isToday ? "border-stone-800 bg-stone-50" : "border-stone-200"}`} style={{ backgroundColor: isToday ? undefined : "var(--paper)" }}>
      <Link
        href={`/page/${pageId}`}
        className="flex flex-col items-center mb-3 group"
      >
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">{dayName}</span>
        <span className={`text-xl font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-stone-100 transition-colors ${isToday ? "bg-stone-800 text-white group-hover:bg-stone-700" : "text-stone-800"}`}>
          {dayNum}
        </span>
      </Link>
      <div className="flex-1 space-y-2 overflow-hidden">
        {blocks.length === 0 ? (
          <p className="text-xs text-stone-300 text-center mt-2">—</p>
        ) : (
          blocks.map((b) => <CompactBlock key={b.id} block={b} />)
        )}
      </div>
    </div>
  );
}

export function WeekView({ weekId }: WeekViewProps) {
  const pageIds = getWeekDays(weekId);
  const { blocksByDay, isLoading } = useWeekBlocks(pageIds);
  const todayId = getTodayPageId();
  const todayWeekId = getTodayWeekId();
  const isCurrentWeek = weekId === todayWeekId;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <nav className="flex items-center gap-2">
            <Link
              href={`/week/${getPrevWeekId(weekId)}`}
              className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Previous week"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-stone-800 min-w-[220px] text-center">
              {formatWeekIdForDisplay(weekId)}
            </h1>
            <Link
              href={`/week/${getNextWeekId(weekId)}`}
              className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Next week"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {!isCurrentWeek && (
              <Link
                href={`/week/${todayWeekId}`}
                className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg"
              >
                This week
              </Link>
            )}
            <ViewSwitcher view="week" currentId={weekId} />
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">
          {pageIds.map((id) => (
            <div key={id} className="border border-stone-200 rounded-xl p-3 h-48 animate-pulse bg-stone-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {pageIds.map((id) => (
            <DayColumn
              key={id}
              pageId={id}
              blocks={blocksByDay[id] ?? []}
              isToday={id === todayId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
