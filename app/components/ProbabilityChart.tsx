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

export default function ProbabilityChart({ data, latestEV }: any) {
  let style = {};

  if ((latestEV ?? 0) > 0) {
    style = {
      background: "linear-gradient(to bottom, rgba(16,185,129,0.08), transparent)",
    };
  } else if ((latestEV ?? 0) < 0) {
    style = {
      background: "linear-gradient(to bottom, rgba(239,68,68,0.08), transparent)",
    };
  }
  return (
    <div className="h-[280px] md:h-[320px] mt-6 rounded-lg" style={style}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#27272a" strokeDasharray="2 2" />

          <XAxis
            dataKey="time"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            domain={[0, 1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            formatter={(value: any) =>
              value != null
                ? `${(Number(value) * 100).toFixed(2)}%`
                : "-"
            }
            contentStyle={{
              backgroundColor: "#09090b",
              border: "1px solid #27272a",
            }}
          />

          {/* Kalshi (BLUE like EV chart) */}
          <Line
            type="monotone"
            dataKey="kalshi"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
          />

          {/* Fair (GREEN like EV positive tone) */}
          <Line
            type="monotone"
            dataKey="fair"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}