"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchMatches } from "../../lib/api";
import TopNav from "../components/TopNav";

type MatchRow = {
  match_id: string;
  home_team: string;
  away_team: string;
  match_title: string;
  top_ev: number | null;
  best_signal: string;
};

type SortOption = "top_ev" | "alphabetical" | "positive_first";

function formatEV(value: number | null) {
  if (value === null || value === undefined) return "No edge";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

function signalClasses(signal: string, topEv: number | null) {
  if (topEv === null || topEv === undefined) {
    return "bg-zinc-800 text-zinc-400";
  }

  if (signal === "Undervalued") {
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-400/15";
  }

  if (signal === "Overvalued") {
    return "bg-red-500/10 text-red-400 border border-red-400/15";
  }

  return "bg-zinc-800 text-zinc-300 border border-white/8";
}

export default function FifaMarketsPage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("top_ev");
  const [positiveOnly, setPositiveOnly] = useState(false);

  useEffect(() => {
    fetchMatches()
      .then((data) => {
        setMatches(data ?? []);
      })
      .catch((err) => {
        console.error("Failed to fetch matches:", err);
        setMatches([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const stats = useMemo(() => {
    const positive = matches.filter(
      (m) => m.top_ev !== null && m.top_ev !== undefined && m.top_ev > 0
    );

    const strongest = [...positive].sort(
      (a, b) => (b.top_ev || 0) - (a.top_ev || 0)
    )[0] ?? null;

    return {
      total: matches.length,
      positiveCount: positive.length,
      strongest,
    };
  }, [matches]);

  const filteredMatches = useMemo(() => {
    let next = [...matches];

    if (positiveOnly) {
      next = next.filter(
        (m) => m.top_ev !== null && m.top_ev !== undefined && m.top_ev > 0
      );
    }

    if (sortBy === "top_ev") {
      next.sort((a, b) => (b.top_ev || 0) - (a.top_ev || 0));
    }

    if (sortBy === "alphabetical") {
      next.sort((a, b) =>
        `${a.home_team} vs ${a.away_team}`.localeCompare(
          `${b.home_team} vs ${b.away_team}`
        )
      );
    }

    if (sortBy === "positive_first") {
      next.sort((a, b) => {
        const aPositive = (a.top_ev || 0) > 0 ? 1 : 0;
        const bPositive = (b.top_ev || 0) > 0 ? 1 : 0;

        if (bPositive !== aPositive) return bPositive - aPositive;
        return (b.top_ev || 0) - (a.top_ev || 0);
      });
    }

    return next;
  }, [matches, positiveOnly, sortBy]);

  return (
    <>
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="mb-10">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
              Live Markets
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              FIFA World Cup Markets
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Monitor current match markets, scan for edge, and jump into the
              most interesting opportunities without digging through raw prices.
            </p>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Live Matches
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {loading ? "—" : stats.total}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Positive Edge Matches
            </div>
            <div className="mt-3 text-3xl font-semibold text-emerald-400">
              {loading ? "—" : stats.positiveCount}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Strongest Edge
            </div>
            <div className="mt-3 text-lg font-semibold text-white">
              {loading
                ? "Loading..."
                : stats.strongest
                ? `${stats.strongest.home_team} vs ${
                    stats.strongest.away_team
                  } · ${formatEV(stats.strongest.top_ev)}`
                : "No positive edge"}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/8 bg-white/5 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-zinc-400">
            Showing{" "}
            <span className="font-medium text-white">{filteredMatches.length}</span>{" "}
            {filteredMatches.length === 1 ? "match" : "matches"}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={positiveOnly}
                onChange={(e) => setPositiveOnly(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-zinc-900 text-white"
              />
              Positive edges only
            </label>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition hover:border-white/20"
              >
                <option value="top_ev">Top EV</option>
                <option value="alphabetical">Match A–Z</option>
                <option value="positive_first">Positive Edge First</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur"
              >
                <div className="h-5 w-48 animate-pulse rounded bg-zinc-800" />
                <div className="mt-4 h-4 w-28 animate-pulse rounded bg-zinc-900" />
              </div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="rounded-3xl border border-white/8 bg-white/5 p-8 text-sm text-zinc-400 backdrop-blur">
            No matches found for the selected filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Link
                key={match.match_id}
                href={`/match/${match.match_id}`}
                className="group block rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="truncate text-2xl font-semibold text-white">
                        {match.home_team} vs {match.away_team}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${signalClasses(
                          match.best_signal,
                          match.top_ev
                        )}`}
                      >
                        {match.top_ev !== null ? match.best_signal : "No edge"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-zinc-500">
                      Click through for EV trend, outcome breakdown, liquidity,
                      and confidence context.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-5 lg:min-w-[220px] lg:justify-end">
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Top EV
                      </div>
                      <div
                        className={`mt-2 text-2xl font-semibold ${
                          match.top_ev !== null && match.top_ev > 0
                            ? "text-emerald-400"
                            : match.top_ev !== null && match.top_ev < 0
                            ? "text-red-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {formatEV(match.top_ev)}
                      </div>
                    </div>

                    <div className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-zinc-300">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}