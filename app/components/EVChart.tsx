"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"

export default function EVChart({
  teamAData,
  teamBData,
  teamA,
  teamB
}: {
  teamAData: any[]
  teamBData: any[]
  teamA: string
  teamB: string
}) {

  const mergedData = teamAData.map((row, i) => ({
    time: row.time,
    evA: row.ev,
    evB: teamBData[i]?.ev ?? null
  }))

  return (

    <ResponsiveContainer width="100%" height="100%">

      <LineChart data={mergedData}>

        <CartesianGrid
          stroke="#27272a"
          strokeDasharray="3 3"
        />

        <XAxis
          dataKey="time"
          stroke="#a1a1aa"
          fontSize={12}
        />

        <YAxis
          stroke="#a1a1aa"
          fontSize={12}
        />

        <Tooltip />

        <ReferenceLine y={0} stroke="#52525b" strokeDasharray="4 4" />

        <Line
          type="monotone"
          dataKey="evA"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />

        <Line
          type="monotone"
          dataKey="evB"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />

      </LineChart>

    </ResponsiveContainer>

  )
}