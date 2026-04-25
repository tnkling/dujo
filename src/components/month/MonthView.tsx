"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import {
  getCalendarDays,
  getPrevMonthId,
  getNextMonthId,
  getTodayPageId,
  getTodayMonthId,
  formatMonthIdForDisplay,
  parsePageId,
} from "@/lib/dates";

const STORAGE_PREFIX = "dujo-page-";
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function hasLocalContent(pageId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${pageId}`);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

interface DayCellProps {
  pageId: string;
  isToday: boolean;
  isCurrentMonth: boolean;
}

function DayCell({ pageId, isToday, isCurrentMonth }: DayCellProps) {
  const [hasContent, setHasContent] = useState(false);
  const date = parsePageId(pageId);
  const dayNum = date ? date.getUTCDate() : "";

  useEffect(() => {
    setHasContent(hasLocalContent(pageId));
  }, [pageId]);

  return (
    <Link
      href={`/page/${pageId}`}
      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-colors relative
        ${isToday ? "bg-stone-800 text-white hover:bg-stone-700" : isCurrentMonth ? "text-stone-700 hover:bg-stone-100" : "text-stone-300 hover:bg-stone-50"}
      `}
    >
      {dayNum}
      {hasContent && !isToday && (
        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-stone-400" />
      )}
      {hasContent && isToday && (
        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white opacity-70" />
      )}
    </Link>
  );
}

interface MonthViewProps {
  monthId: string;
}

export function MonthView({ monthId }: MonthViewProps) {
  const days = getCalendarDays(monthId);
  const todayId = getTodayPageId();
  const todayMonthId = getTodayMonthId();
  const isCurrentMonth = monthId === todayMonthId;
  const currentYear = monthId.slice(0, 4);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <nav className="flex items-center gap-2">
            <Link
              href={`/month/${getPrevMonthId(monthId)}`}
              className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-stone-800 min-w-[180px] text-center">
              {formatMonthIdForDisplay(monthId)}
            </h1>
            <Link
              href={`/month/${getNextMonthId(monthId)}`}
              className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {!isCurrentMonth && (
              <Link
                href={`/month/${todayMonthId}`}
                className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg"
              >
                This month
              </Link>
            )}
            <ViewSwitcher view="month" currentId={monthId} />
          </div>
        </div>
      </header>

      <div className="border border-stone-200 rounded-xl overflow-hidden" style={{ backgroundColor: "var(--paper)" }}>
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-stone-200">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-stone-500 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 p-2 gap-1">
          {days.map((pageId, i) =>
            pageId ? (
              <DayCell
                key={pageId}
                pageId={pageId}
                isToday={pageId === todayId}
                isCurrentMonth={pageId.slice(0, 7) === monthId}
              />
            ) : (
              <div key={`pad-${i}`} />
            )
          )}
        </div>

        <div className="border-t border-stone-200 px-4 py-3 text-xs text-stone-400 text-center">
          Click any day to open its journal page
        </div>
      </div>

      <p className="mt-4 text-xs text-stone-400 text-center">
        {currentYear} • Dots indicate days with content
      </p>
    </div>
  );
}
