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
import { Area } from "recharts";
export default function ProbabilityChart({ data, latestEV }: any) {
  console.log("probability data", data?.slice(0, 3));
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
    <div className="w-full h-[300px] mt-6 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="kalshiGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="fairGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          {/* Kalshi glow */}
         {/* Base (invisible lower bound) */}
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="transparent"
          />

          {/* Actual shaded gap */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="rgba(59,130,246,0.25)"   // blue tint
          />
          {/* Kalshi (BLUE like EV chart) */}
          <Line
            type="monotone"
            dataKey="kalshi"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="fair"
            stroke="#a3a3a3"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}