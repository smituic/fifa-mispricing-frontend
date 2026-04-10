"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Opportunity = {
  match_id: string;
  match_title: string;
  outcome_team: string;
  expected_value: number;
  signal: string;
  confidence_score?: number;
  liquidity_score?: number;
};

type OpportunitiesResponse = {
  best_positive: Opportunity | null;
  positive_count: number;
  negative_count: number;
  positive_opportunities: Opportunity[];
  negative_opportunities: Opportunity[];
};

function formatEV(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

function signalClasses(signal: string) {
  if (signal === "Undervalued") {
    return "bg-emerald-500/10 text-emerald-400";
  }
  if (signal === "Overvalued") {
    return "bg-red-500/10 text-red-400";
  }
  return "bg-zinc-500/10 text-zinc-300";
}

export default function OpportunitiesPage() {
  const [data, setData] = useState<OpportunitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/kalshi/fifa/opportunities", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        console.error("Failed to fetch opportunities:", err);
        setData({
          best_positive: null,
          positive_count: 0,
          negative_count: 0,
          positive_opportunities: [],
          negative_opportunities: [],
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const bestPositive = data?.best_positive ?? null;
  const positiveSignals = data?.positive_opportunities ?? [];
  const negativeSignals = data?.negative_opportunities ?? [];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            🔥 Top EV Opportunities
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Best market opportunities by match, with the strongest outcome shown for each one.
          </p>
        </div>

        <Link
          href="/fifa"
          className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white"
        >
          ← Back to Markets
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Best Signal
          </div>
          <div className="mt-2 text-lg font-semibold text-emerald-400">
            {bestPositive
              ? `${bestPositive.match_title} · ${bestPositive.outcome_team} (${formatEV(bestPositive.expected_value)})`
              : "No positive edge"}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Positive Matches
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {data?.positive_count ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Overvalued Matches
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {data?.negative_count ?? 0}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400">
          Loading opportunities...
        </div>
      ) : (
        <>
          <section className="mb-14">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Best Opportunities
              </h2>
              <span className="text-sm text-zinc-500">
                One card per match
              </span>
            </div>

            {positiveSignals.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400">
                No strong positive opportunities right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {positiveSignals.map((s, index) => (
                  <Link
                    key={s.match_id}
                    href={`/match/${s.match_id}`}
                    className={`rounded-2xl border bg-zinc-900 p-5 transition hover:scale-[1.02] hover:bg-zinc-800/80 ${
                      index === 0
                        ? "border-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                        : "border-zinc-800"
                    }`}
                  >
                    {index === 0 && (
                      <div className="mb-3 text-xs font-medium uppercase tracking-widest text-emerald-400">
                        Top Signal
                      </div>
                    )}

                    <h3 className="mb-2 text-xl font-semibold text-white">
                      {s.match_title}
                    </h3>

                    <div className="mb-1 text-sm text-zinc-400">
                      Best Outcome
                    </div>
                    <div className="mb-3 text-base font-medium text-zinc-200">
                      {s.outcome_team}
                    </div>

                    <div className="mb-3 text-3xl font-bold text-emerald-400">
                      {formatEV(s.expected_value)}
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${signalClasses(
                          s.signal
                        )}`}
                      >
                        {s.signal}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-zinc-400">
                      <span>
                        Confidence {s.confidence_score?.toFixed(2) ?? "0.00"} / 10
                      </span>
                      <span>
                        Liquidity {s.liquidity_score?.toFixed(2) ?? "0.00"} / 10
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Avoid / Overvalued
              </h2>
              <span className="text-sm text-zinc-500">
                Worst priced outcome per match
              </span>
            </div>

            {negativeSignals.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400">
                No overvalued matches right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {negativeSignals.map((s) => (
                  <Link
                    key={s.match_id}
                    href={`/match/${s.match_id}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:scale-[1.01] hover:bg-zinc-800/70"
                  >
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {s.match_title}
                    </h3>

                    <div className="mb-1 text-sm text-zinc-400">
                      Most Overvalued Outcome
                    </div>
                    <div className="mb-3 text-base font-medium text-zinc-200">
                      {s.outcome_team}
                    </div>

                    <div className="mb-3 text-2xl font-bold text-red-400">
                      {formatEV(s.expected_value)}
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${signalClasses(
                          s.signal
                        )}`}
                      >
                        {s.signal}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>
                        Confidence {s.confidence_score?.toFixed(2) ?? "0.00"} / 10
                      </span>
                      <span>
                        Liquidity {s.liquidity_score?.toFixed(2) ?? "0.00"} / 10
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}