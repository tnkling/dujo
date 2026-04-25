"use client";

import Link from "next/link";
import { getWeekIdForDate, getMonthIdForDate, getWeekDays, parseMonthId, toPageId } from "@/lib/dates";

export type ViewType = "day" | "week" | "month";

interface ViewSwitcherProps {
  view: ViewType;
  /** For day view: the page ID. For week view: the week ID. For month view: the month ID. */
  currentId: string;
}

function getDayHref(view: ViewType, currentId: string): string {
  if (view === "day") return `/page/${currentId}`;
  if (view === "week") {
    const days = getWeekDays(currentId);
    return `/page/${days[0]}`;
  }
  const d = parseMonthId(currentId);
  if (!d) return `/page/${currentId}`;
  return `/page/${toPageId(d)}`;
}

function getWeekHref(view: ViewType, currentId: string): string {
  if (view === "day") return `/week/${getWeekIdForDate(currentId)}`;
  if (view === "week") return `/week/${currentId}`;
  const d = parseMonthId(currentId);
  if (!d) return `/week/${currentId}`;
  return `/week/${getWeekIdForDate(toPageId(d))}`;
}

function getMonthHref(view: ViewType, currentId: string): string {
  if (view === "day") return `/month/${getMonthIdForDate(currentId)}`;
  if (view === "week") return `/month/${getMonthIdForDate(currentId)}`;
  return `/month/${currentId}`;
}

export function ViewSwitcher({ view, currentId }: ViewSwitcherProps) {
  const base = "px-2.5 py-1 text-xs font-medium rounded transition-colors";
  const active = "bg-stone-800 text-white";
  const inactive = "text-stone-500 hover:text-stone-800 hover:bg-stone-100";

  return (
    <div className="flex items-center gap-0.5 bg-stone-100 rounded p-0.5">
      <Link href={getDayHref(view, currentId)} className={`${base} ${view === "day" ? active : inactive}`}>
        Day
      </Link>
      <Link href={getWeekHref(view, currentId)} className={`${base} ${view === "week" ? active : inactive}`}>
        Week
      </Link>
      <Link href={getMonthHref(view, currentId)} className={`${base} ${view === "month" ? active : inactive}`}>
        Month
      </Link>
    </div>
  );
}
