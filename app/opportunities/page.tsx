"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OpportunitiesPage() {
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/kalshi/fifa/top-signals")
      .then((res) => res.json())
      .then((data) => {
        setSignals(data.top_signals || []);
      });
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-8">
        🔥 Top EV Opportunities
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signals.map((s: any, index) => {
          const isPositive = s.expected_value > 0;

          return (
            <Link
              key={`${s.match_id}-${s.team}`}
              href={`/match/${s.match_id}`}
              className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:scale-[1.02] transition shadow-sm"
            >
              {/* 🔥 Best badge */}
              {index === 0 && (
                <div className="text-xs text-yellow-400 mb-2">
                  🔥 Best Opportunity
                </div>
              )}

              {/* Match */}
              <h2 className="text-lg font-semibold mb-2">
                {s.match}
              </h2>

              {/* EV (MAIN FOCUS) */}
              <div
                className={`text-2xl font-bold mb-3 ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {(s.expected_value * 100).toFixed(2)}%
              </div>

              {/* Signal Badge */}
              <div className="mb-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    isPositive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {isPositive ? "Undervalued" : "Overvalued"}
                </span>

                <span className="text-zinc-400 text-sm ml-2">
                  ({s.team})
                </span>
              </div>

              {/* Metrics */}
              <div className="text-sm text-zinc-400 flex justify-between">
                <span>Conf: {s.confidence_score?.toFixed(2)}</span>
                <span>Liq: {s.liquidity_score?.toFixed(2)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}