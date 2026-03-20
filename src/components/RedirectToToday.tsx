"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTodayPageId } from "@/lib/dates";

/** Client-side redirect to today's page (uses user's local timezone) */
export function RedirectToToday() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/page/${getTodayPageId()}`);
  }, [router]);
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <span className="text-zinc-400">Loading...</span>
    </div>
  );
}
