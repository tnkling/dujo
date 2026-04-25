import { notFound } from "next/navigation";
import { MonthView } from "@/components/month/MonthView";
import { parseMonthId } from "@/lib/dates";

interface PageProps {
  params: Promise<{ month: string }>;
}

export default async function MonthPage({ params }: PageProps) {
  const { month } = await params;
  if (!parseMonthId(month)) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <MonthView monthId={month} />
    </div>
  );
}
