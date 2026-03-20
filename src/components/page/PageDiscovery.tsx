"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePersistedPageIds } from "@/hooks/usePersistedPageIds";
import { formatPageIdForDisplay, getTodayPageId } from "@/lib/dates";

const MAX_PAGES_SHOWN = 30;

interface PageDiscoveryProps {
  currentPageId: string;
  onClose?: () => void;
}

export function PageDiscovery({ currentPageId, onClose }: PageDiscoveryProps) {
  const router = useRouter();
  const { pageIds: allPageIds, refresh } = usePersistedPageIds();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const todayId = getTodayPageId();

  const pageIds = allPageIds.slice(0, MAX_PAGES_SHOWN);

  // Refresh list when dropdown opens
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onClose?.();
      router.push(`/page/${value}`);
    }
  };

  return (
    <div className="w-64 flex flex-col max-h-[320px]">
      <div className="flex-1 overflow-y-auto py-1 min-h-0">
        {pageIds.length === 0 ? (
          <p className="px-4 py-3 text-sm text-zinc-500">
            No pages yet. Add content to a page to see it here.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {pageIds.map((id) => (
              <li key={id}>
                <Link
                  href={`/page/${id}`}
                  onClick={onClose}
                  className={`block px-4 py-2 text-sm rounded-md hover:bg-zinc-50 ${
                    id === currentPageId
                      ? "bg-zinc-100 text-zinc-900 font-medium"
                      : "text-zinc-700"
                  } ${id === todayId ? "italic" : ""}`}
                >
                  {formatPageIdForDisplay(id)}
                  {id === todayId && " (today)"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-zinc-200 pt-2 mt-2">
        {showDatePicker ? (
          <div className="px-4 pb-3">
            <input
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              onChange={handleDateChange}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowDatePicker(false)}
              className="mt-2 text-xs text-zinc-500 hover:text-zinc-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="w-full px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800 text-left"
          >
            Go to date…
          </button>
        )}
      </div>
    </div>
  );
}
