"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatINR } from "@/lib/utils";

export interface WeeklyDatum {
  label: string;
  range: string;
  amount: number;
}

export function WeeklyBars({ data }: { data: WeeklyDatum[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#6B7280" }}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
          formatter={(v: number) => [formatINR(v), "Spent"]}
          labelFormatter={(_, p) => p?.[0]?.payload?.range ?? ""}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.06)",
            fontSize: 12,
          }}
        />
        <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={44}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.amount >= max ? "#FC8019" : "#1BA672"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
