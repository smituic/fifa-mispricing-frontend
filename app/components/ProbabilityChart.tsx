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

  const dotColor = isPositive ? "#22c55e" : "#ef4444";
  const dotGlow = isPositive ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)";

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
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {(latestEV * 100).toFixed(2)}% EDGE
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={enriched} syncId="prob-sync">
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
            interval="preserveStartEnd"
            minTickGap={50}
            padding={{ left: 0, right: 15 }}
          />

          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            cursor={{ stroke: "#52525b", strokeWidth: 1 }}
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
                        edge > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {(edge * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            }}
          />

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
            fill="#09090b"
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="kalshi"
            stroke="#3b82f6"
            strokeWidth={3}
            isAnimationActive={false}
            dot={(props: any) => {
              const { cx, cy, index } = props;
              if (index !== enriched.length - 1) return <circle r={0} />;

              return (
                <g key={`dot-${cx}-${cy}`}>
                  {/* Pulsing ring — color matches EV sign */}
                  <circle cx={cx} cy={cy} r={6} fill={dotGlow}>
                    <animate
                      attributeName="r"
                      values="6;16;6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.7;0;0.7"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Static center dot — color matches EV sign */}
                  <circle cx={cx} cy={cy} r={5} fill={dotColor} />
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