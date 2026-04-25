import { notFound } from "next/navigation";
import { WeekView } from "@/components/week/WeekView";
import { parseWeekId } from "@/lib/dates";

interface PageProps {
  params: Promise<{ week: string }>;
}

export default async function WeekPage({ params }: PageProps) {
  const { week } = await params;
  if (!parseWeekId(week)) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <WeekView weekId={week} />
    </div>
  );
}
