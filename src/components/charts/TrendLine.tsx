"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendDatum {
  label: string;
  value: number;
}

export function TrendLine({ data }: { data: TrendDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#6B7280" }}
        />
        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#6B7280" }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.06)",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#1BA672"
          strokeWidth={3}
          dot={{ r: 4, fill: "#1BA672" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
