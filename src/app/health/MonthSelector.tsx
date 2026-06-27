"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

const MONTH_LABELS: Record<string, string> = {
  "2025-01": "January 2025",
  "2025-02": "February 2025",
  "2025-03": "March 2025",
  "2025-04": "April 2025",
  "2025-05": "May 2025",
  "2025-06": "June 2025",
};

export function MonthSelector({ months, selected }: { months: string[]; selected: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-ink-muted" />
      <select
        value={selected}
        onChange={(e) => router.push(`/health?month=${e.target.value}`)}
        className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-brand cursor-pointer"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {MONTH_LABELS[m] ?? m}
          </option>
        ))}
      </select>
    </div>
  );
}
