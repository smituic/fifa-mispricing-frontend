"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
    <div className="rounded-xl border border-zinc-800 bg-black/95 px-4 py-3 shadow-2xl">
      <div className="mb-2 text-sm text-zinc-300">{label}</div>

      {typeof evA === "number" && (
        <div className="text-sm" style={{ color: "#3b82f6" }}>
          {teamA}: {formatEV(evA)}
        </div>
      )}

      {typeof evB === "number" && (
        <div className="text-sm" style={{ color: "#22c55e" }}>
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

  const latest = mergedData[mergedData.length - 1];

  return (
    
      
        <LineChart width={500} height={300}
          data={mergedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          
        >
          <defs>
            <linearGradient id="evABlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>

            <linearGradient id="evBGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
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
            width={42}
            tickFormatter={(value) => formatEV(value)}
            domain={["auto", "auto"]}
          />

          <Tooltip
            content={
              <CustomTooltip
                teamA={teamA}
                teamB={teamB}
              />
            }
            cursor={{ stroke: "#52525b", strokeWidth: 1 }}
          />

          <ReferenceLine
            y={0}
            stroke="#3f3f46"
            strokeDasharray="4 4"
          />

          <Line
            type="monotone"
            dataKey="evA"
            stroke="#3b82f6"
            fill="none"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="evB"
            stroke="#22c55e"
            fill="none"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />


        </LineChart>
      
    
  );
}