"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Signal = {
  match_id: string;
  match: string;
  team: string;
  expected_value: number;
  confidence_score?: number;
  liquidity_score?: number;
};

export default function OpportunitiesPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/kalshi/fifa/top-signals")
      .then((res) => res.json())
      .then((data) => {
        setSignals(data.top_signals || []);
      })
      .catch((err) => {
        console.error("Failed to fetch signals:", err);
        setSignals([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const { positiveSignals, negativeSignals, bestPositive } = useMemo(() => {
    const positives = signals
      .filter((s) => s.expected_value > 0)
      .sort((a, b) => b.expected_value - a.expected_value);

    const negatives = signals
      .filter((s) => s.expected_value <= 0)
      .sort((a, b) => a.expected_value - b.expected_value);

    return {
      positiveSignals: positives,
      negativeSignals: negatives,
      bestPositive: positives[0] || null,
    };
  }, [signals]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            🔥 Top EV Opportunities
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Highest positive edges across current FIFA markets.
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
              ? `${bestPositive.match} (${(bestPositive.expected_value * 100).toFixed(2)}%)`
              : "No positive edge"}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Positive Signals
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {positiveSignals.length}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Overvalued Markets
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {negativeSignals.length}
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
                Positive EV only
              </span>
            </div>

            {positiveSignals.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400">
                No strong positive opportunities right now. Market looks fairly efficient.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {positiveSignals.map((s, index) => (
                  <Link
                    key={`${s.match_id}-${s.team}`}
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
                      {s.match}
                    </h3>

                    <div className="mb-3 text-3xl font-bold text-emerald-400">
                      +{(s.expected_value * 100).toFixed(2)}%
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        Undervalued
                      </span>
                      <span className="text-sm text-zinc-400">({s.team})</span>
                    </div>

                    <div className="flex justify-between text-sm text-zinc-400">
                      <span>Confidence {s.confidence_score?.toFixed(2) ?? "0.00"} / 10</span>
                      <span>Liquidity {s.liquidity_score?.toFixed(2) ?? "0.00"} / 10</span>
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
                Negative EV signals
              </span>
            </div>

            {negativeSignals.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400">
                No overvalued markets in the current window.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {negativeSignals.map((s) => (
                  <Link
                    key={`${s.match_id}-${s.team}`}
                    href={`/match/${s.match_id}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:scale-[1.01] hover:bg-zinc-800/70"
                  >
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {s.match}
                    </h3>

                    <div className="mb-3 text-2xl font-bold text-red-400">
                      {(s.expected_value * 100).toFixed(2)}%
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                        Overvalued
                      </span>
                      <span className="text-sm text-zinc-400">({s.team})</span>
                    </div>

                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Confidence {s.confidence_score?.toFixed(2) ?? "0.00"} / 10</span>
                      <span>Liquidity {s.liquidity_score?.toFixed(2) ?? "0.00"} / 10</span>
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