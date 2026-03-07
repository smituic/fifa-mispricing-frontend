"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ProbabilityChart({ data }: any) {
  return (
   <div className="h-[260px] bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#27272a" strokeDasharray="2 2" />

          <XAxis
            dataKey="time"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            />

          <YAxis domain={[0, 1]} />

          <Tooltip
            contentStyle={{
                backgroundColor: "#09090b",
                border: "1px solid #27272a",
            }}
            />

          <Line
            type="monotone"
            dataKey="kalshi"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="fair"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}