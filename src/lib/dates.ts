/** ISO date string (YYYY-MM-DD) for page IDs */
export function toPageId(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getTodayPageId(): string {
  return toPageId(new Date());
}

export function parsePageId(pageId: string): Date | null {
  const date = new Date(pageId);
  return isNaN(date.getTime()) ? null : date;
}

export function formatPageIdForDisplay(pageId: string): string {
  const date = parsePageId(pageId);
  if (!date) return pageId;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function getPrevPageId(pageId: string): string {
  const date = parsePageId(pageId);
  if (!date) return pageId;
  const prev = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1));
  return toPageId(prev);
}

export function getNextPageId(pageId: string): string {
  const date = parsePageId(pageId);
  if (!date) return pageId;
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
  return toPageId(next);
}

// ── Week helpers ──────────────────────────────────────────────────────────────

/** Monday of the week containing date (UTC) */
export function getWeekStart(date: Date): Date {
  const dow = date.getUTCDay(); // 0=Sun
  const diff = (dow + 6) % 7; // days since Monday
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diff));
}

/** Week ID = ISO date of the Monday for that week */
export function toWeekId(date: Date): string {
  return toPageId(getWeekStart(date));
}

export function getTodayWeekId(): string {
  return toWeekId(new Date());
}

export function parseWeekId(weekId: string): Date | null {
  return parsePageId(weekId);
}

/** Returns 7 page IDs (Mon–Sun) for the week */
export function getWeekDays(weekId: string): string[] {
  const start = parseWeekId(weekId);
  if (!start) return [];
  return Array.from({ length: 7 }, (_, i) =>
    toPageId(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i)))
  );
}

export function getPrevWeekId(weekId: string): string {
  const d = parseWeekId(weekId);
  if (!d) return weekId;
  return toPageId(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - 7)));
}

export function getNextWeekId(weekId: string): string {
  const d = parseWeekId(weekId);
  if (!d) return weekId;
  return toPageId(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 7)));
}

export function getWeekIdForDate(pageId: string): string {
  const d = parsePageId(pageId);
  return d ? toWeekId(d) : pageId;
}

export function formatWeekIdForDisplay(weekId: string): string {
  const start = parseWeekId(weekId);
  if (!start) return weekId;
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6));
  const s = start.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const e = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  return `${s} – ${e}`;
}

// ── Month helpers ─────────────────────────────────────────────────────────────

/** Month ID = YYYY-MM */
export function toMonthId(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export function getTodayMonthId(): string {
  return toMonthId(new Date());
}

export function parseMonthId(monthId: string): Date | null {
  const d = new Date(`${monthId}-01`);
  return isNaN(d.getTime()) ? null : d;
}

export function getPrevMonthId(monthId: string): string {
  const d = parseMonthId(monthId);
  if (!d) return monthId;
  return toMonthId(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)));
}

export function getNextMonthId(monthId: string): string {
  const d = parseMonthId(monthId);
  if (!d) return monthId;
  return toMonthId(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)));
}

export function getMonthIdForDate(pageId: string): string {
  const d = parsePageId(pageId);
  return d ? toMonthId(d) : pageId;
}

export function formatMonthIdForDisplay(monthId: string): string {
  const d = parseMonthId(monthId);
  if (!d) return monthId;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/**
 * Returns Mon-based calendar grid for the month.
 * Cells are page IDs or null for padding days outside the month.
 */
export function getCalendarDays(monthId: string): (string | null)[] {
  const first = parseMonthId(monthId);
  if (!first) return [];
  const year = first.getUTCFullYear();
  const month = first.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startPadding = (first.getUTCDay() + 6) % 7; // Mon=0
  const days: (string | null)[] = Array(startPadding).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(toPageId(new Date(Date.UTC(year, month, d))));
  }
  while (days.length % 7 !== 0) days.push(null);
  return days;
}
