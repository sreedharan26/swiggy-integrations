"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatINR } from "@/lib/utils";

export interface DonutDatum {
  label: string;
  amount: number;
  percent: number;
}

const COLORS = ["#FC8019", "#1BA672", "#3B82F6", "#A855F7"];

export function CategoryDonut({
  data,
  total,
}: {
  data: DonutDatum[];
  total: number;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="label"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold">{formatINR(total)}</span>
          <span className="text-[11px] text-ink-muted">Total spent</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 text-ink-muted">{d.label}</span>
            <span className="font-semibold">{d.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
