"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ProbabilityChart({ data, latestEV }: any) {
  const isPositive = (latestEV ?? 0) >= 0;

  const shadingColor = isPositive
    ? "rgba(34,197,94,0.3)"
    : "rgba(239,68,68,0.3)";

  // Add lower/upper band fields for area shading between the two lines
  const enriched = data.map((d: any) => ({
    ...d,
    lower: Math.min(d.kalshi, d.fair),
    upper: Math.max(d.kalshi, d.fair),
  }));

  const values = data.flatMap((d: any) => [d.kalshi, d.fair]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = 0.02;
  const yMin = Math.max(0, minVal - padding);
  const yMax = Math.min(1, maxVal + padding);
  

  return (
    <div className="w-full mt-6 rounded-lg bg-gradient-to-b from-zinc-900/40 to-transparent p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-zinc-400 text-sm">Probability</span>

        <span
          className={`text-sm font-semibold ${
            latestEV > 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {(latestEV * 100).toFixed(2)}% EDGE
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={enriched}>
          <defs>
            <linearGradient id="shadingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={shadingColor} stopOpacity={1} />
              <stop offset="100%" stopColor={shadingColor} stopOpacity={0} />
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
            domain={[yMin, yMax]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;

              const point = payload[0].payload;

              const kalshi = point.kalshi;
              const fair = point.fair;
              const edge = fair - kalshi;

              return (
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm shadow-lg">
                  <div className="text-zinc-400 mb-2">{label}</div>

                  <div className="flex justify-between gap-6">
                    <span className="text-zinc-400">Kalshi</span>
                    <span className="text-blue-400 font-medium">
                      {(kalshi * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-between gap-6">
                    <span className="text-zinc-400">Fair</span>
                    <span className="text-zinc-300 font-medium">
                      {(fair * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div className="border-t border-zinc-800 my-2" />

                  <div className="flex justify-between gap-6">
                    <span className="text-zinc-400">Edge</span>
                    <span
                      className={`font-semibold ${
                        edge > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {(edge * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            }}
          />

          {/* Transparent baseline so Area shades between lower and upper */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#shadingGradient)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#09090b"  // match your background to "cut out" below the lower line
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="kalshi"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, index } = props;
            
              if (index !== data.length - 1) return null;
            
              return (
                <g>
                  {/* glow layer */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={10}
                    fill="rgba(59,130,246,0.15)"
                    className="animate-pulse-slow"
                  />
            
                  {/* main dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#3b82f6"
                  />
                </g>
              );
            }}
          />

          <Line
            type="monotone"
            dataKey="fair"
            stroke="#a3a3a3"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}