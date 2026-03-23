"use client";

import { useEffect, useState } from "react";
import { fetchEvMovers } from "../../lib/api";
import Link from "next/link";

export default function EvMovers() {
  const [movers, setMovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(6);

  useEffect(() => {
    setLoading(true);

    fetchEvMovers(hours)
      .then((data) => {
        console.log("MOVERS DATA:", data);
        setMovers(data ?? []);
      })
      .catch(() => setMovers([]))
      .finally(() => setLoading(false));
  }, [hours]);

  if (loading) {
    return <p className="p-10">Loading EV movers...</p>;
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">
        EV Movers (Last {hours}h)
      </h1>

      {/* 🔥 FILTER BUTTONS */}
      <div className="flex gap-2 mb-6">
        {[6, 24, 72, 168].map((h) => (
          <button
            key={h}
            onClick={() => setHours(h)}
            className={`px-3 py-1 rounded border text-sm ${
              hours === h
                ? "bg-white text-black"
                : "bg-zinc-900 text-white border-zinc-700"
            }`}
          >
            {h === 6 && "6H"}
            {h === 24 && "24H"}
            {h === 72 && "3D"}
            {h === 168 && "7D"}
          </button>
        ))}
      </div>

      {/* 🔍 CONTEXT TEXT */}
      <div className="text-sm text-zinc-400 mb-4">
        Showing EV momentum over last {hours} hours
      </div>

      <div className="space-y-4">
        {(movers ?? []).map((m: any) => (
          <Link
            key={`${m.match_id}-${m.team}`}
            href={`/match/${m.match_id}`}
            className="block border p-4 rounded flex justify-between hover:bg-zinc-900 transition"
          >
            <div>{m.match}</div>

            <div
              className={`font-semibold ${
                m.ev_change > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {m.ev_change > 0 ? "↑" : "↓"}{" "}
              {(m.ev_change * 100).toFixed(2)}%
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}