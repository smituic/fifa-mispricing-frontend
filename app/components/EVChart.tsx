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

export default function EVChart({ data }: any) {
  return (
    <div className="h-[260px] bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            />

          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            />

          <Tooltip
            contentStyle={{
                backgroundColor: "#09090b",
                border: "1px solid #27272a",
            }}
            />

          <Line
            type="monotone"
            dataKey="ev"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}