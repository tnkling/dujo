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
  });
}

export function getPrevPageId(pageId: string): string {
  const date = parsePageId(pageId);
  if (!date) return pageId;
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  return toPageId(prev);
}

export function getNextPageId(pageId: string): string {
  const date = parsePageId(pageId);
  if (!date) return pageId;
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return toPageId(next);
}
