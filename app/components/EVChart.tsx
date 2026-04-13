"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from "recharts";

type EVRow = {
  time: string;
  ev: number;
};

function formatEV(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

function CustomTooltip({
  active,
  payload,
  label,
  teamA,
  teamB,
}: any) {
  if (!active || !payload || !payload.length) return null;

  const evA = payload.find((item: any) => item.dataKey === "evA")?.value;
  const evB = payload.find((item: any) => item.dataKey === "evB")?.value;

  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/95 px-4 py-3 shadow-2xl backdrop-blur">
      <div className="mb-2 text-sm text-zinc-400">{label}</div>

      {typeof evA === "number" && (
        <div className="text-sm text-blue-400">
          {teamA}: {formatEV(evA)}
        </div>
      )}

      {typeof evB === "number" && (
        <div className="mt-1 text-sm text-emerald-400">
          {teamB}: {formatEV(evB)}
        </div>
      )}
    </div>
  );
}

export default function EVChart({
  teamAData,
  teamBData,
  teamA,
  teamB,
}: {
  teamAData: EVRow[];
  teamBData: EVRow[];
  teamA: string;
  teamB: string;
}) {
  const mergedData = teamAData.map((row, i) => ({
    time: row.time,
    evA: row.ev,
    evB: teamBData[i]?.ev ?? null,
  }));

  if (!mergedData.length) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-zinc-500">
        No EV history available for this window.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={mergedData}
          margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="evBlueFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="evGreenFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />

          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(value) => formatEV(value)}
            domain={["auto", "auto"]}
          />

          <Tooltip
            content={<CustomTooltip teamA={teamA} teamB={teamB} />}
            cursor={{ stroke: "#3f3f46", strokeWidth: 1 }}
          />

          <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="4 4" />

          <Area
            type="monotone"
            dataKey="evA"
            stroke="none"
            fill="url(#evBlueFade)"
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="evB"
            stroke="none"
            fill="url(#evGreenFade)"
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="evA"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="evB"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}