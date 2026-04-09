"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMatches } from "../../lib/api";

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches()
      .then((data) => {
        const sorted = [...data].sort(
          (a: any, b: any) => (b.top_ev || 0) - (a.top_ev || 0)
        );
        setMatches(sorted);
      })
      .catch((err) => {
        console.error("Failed to fetch matches:", err);
        setMatches([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">FIFA World Cup Markets</h1>

        <Link
          href="/opportunities"
          className="text-sm text-zinc-400 hover:text-white"
        >
          Opportunities →
        </Link>

        <Link
          href="/movers"
          className="text-sm text-zinc-400 hover:text-white"
        >
          EV Movers →
        </Link>
      </div>

      {loading && <p>Loading matches...</p>}

      <div className="space-y-4">
        {matches.map((match) => (
          <Link
            key={match.match_id}
            href={`/match/${match.match_id}`}
            className="block border p-6 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {match.home_team} vs {match.away_team}
                </h2>

                
              </div>

              <div
                className={`text-lg font-bold ${
                  match.top_ev > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {match.top_ev !== null? `EV: ${match.top_ev > 0 ? "+" : ""}${(match.top_ev * 100).toFixed(2)}%`: "No edge"}

              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}