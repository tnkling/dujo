import { notFound } from "next/navigation";
import { JournalPage } from "@/components/page/JournalPage";
import { mockBlocks } from "@/data/mockBlocks";
import { parsePageId, formatPageIdForDisplay } from "@/lib/dates";

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function DatePage({ params }: PageProps) {
  const { date } = await params;
  const pageId = date;

  if (!parsePageId(pageId)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <JournalPage
        pageId={pageId}
        todayFallbackBlocks={mockBlocks}
        pageTitle={formatPageIdForDisplay(pageId)}
      />
    </div>
  );
}
