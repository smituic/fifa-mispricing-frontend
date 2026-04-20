"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchOpportunities } from "@/lib/api";
import TopNav from "../components/TopNav";

type Opportunity = {
  match_id: string;
  match_title: string;
  outcome_team: string;
  expected_value: number;
  signal: string;
  confidence_score?: number;
  confidence_label?: string;
  liquidity_score?: number;
  liquidity_label?: string;
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

function formatScore(
  label: string | undefined,
  score: number | undefined,
  fallback: string
) {
  return `${label ?? fallback} (${(score ?? 0).toFixed(1)} / 10)`;
}

function signalClasses(signal: string) {
  if (signal === "Undervalued") {
    return "border border-emerald-400/15 bg-emerald-500/10 text-emerald-400";
  }
  if (signal === "Overvalued") {
    return "border border-red-400/15 bg-red-500/10 text-red-400";
  }
  return "border border-white/8 bg-zinc-500/10 text-zinc-300";
}

export default function OpportunitiesPage() {
  const [data, setData] = useState<OpportunitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreGuideOpen, setScoreGuideOpen] = useState(false);

  useEffect(() => {
    fetchOpportunities()
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
    <>
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              Ranked Opportunities
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Top EV Opportunities
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              The strongest current edges by match, with the most interesting
              outcome highlighted first.
            </p>

            <button
              onClick={() => setScoreGuideOpen(true)}
              className="mt-4 text-sm text-zinc-500 underline underline-offset-4 transition hover:text-zinc-300"
            >
              How scoring works
            </button>
          </div>

          <Link
            href="/fifa"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
          >
            ← Back to Markets
          </Link>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Best Signal
            </div>
            <div className="mt-3 text-lg font-semibold text-emerald-400">
              {bestPositive
                ? `${bestPositive.match_title} · ${bestPositive.outcome_team} (${formatEV(
                    bestPositive.expected_value
                  )})`
                : "No positive edge"}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Positive Matches
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {data?.positive_count ?? 0}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Overvalued Matches
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {data?.negative_count ?? 0}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/8 bg-white/5 p-8 text-sm text-zinc-400 backdrop-blur">
            Loading opportunities...
          </div>
        ) : (
          <>
            <section className="mb-16">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">
                  Best Opportunities
                </h2>
                <span className="text-sm text-zinc-500">One card per match</span>
              </div>

              {positiveSignals.length === 0 ? (
                <div className="rounded-3xl border border-white/8 bg-white/5 p-8 text-sm text-zinc-400 backdrop-blur">
                  No strong positive opportunities right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {positiveSignals.map((s, index) => (
                    <Link
                      key={s.match_id}
                      href={`/match/${s.match_id}`}
                      className={`group rounded-3xl border bg-white/5 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.07] ${
                        index === 0
                          ? "border-emerald-500/25 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]"
                          : "border-white/8"
                      }`}
                    >
                      {index === 0 && (
                        <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
                          Top Signal
                        </div>
                      )}

                      <h3 className="mb-3 text-2xl font-semibold text-white">
                        {s.match_title}
                      </h3>

                      <div className="mb-1 text-sm text-zinc-500">Best Outcome</div>
                      <div className="mb-4 text-base font-medium text-zinc-200">
                        {s.outcome_team}
                      </div>

                      <div className="mb-4 text-4xl font-semibold text-emerald-400">
                        {formatEV(s.expected_value)}
                      </div>

                      <div className="mb-5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${signalClasses(
                            s.signal
                          )}`}
                        >
                          {s.signal}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-zinc-400">
                        <div>
                          Confidence:{" "}
                          {formatScore(
                            s.confidence_label,
                            s.confidence_score,
                            "Unrated"
                          )}
                        </div>
                        <div>
                          Liquidity:{" "}
                          {formatScore(
                            s.liquidity_label,
                            s.liquidity_score,
                            "Unknown"
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">
                  Avoid / Overvalued
                </h2>
                <span className="text-sm text-zinc-500">
                  Worst priced outcome per match
                </span>
              </div>

              {negativeSignals.length === 0 ? (
                <div className="rounded-3xl border border-white/8 bg-white/5 p-8 text-sm text-zinc-400 backdrop-blur">
                  No overvalued matches right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {negativeSignals.map((s) => (
                    <Link
                      key={s.match_id}
                      href={`/match/${s.match_id}`}
                      className="group rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
                    >
                      <h3 className="mb-3 text-2xl font-semibold text-white">
                        {s.match_title}
                      </h3>

                      <div className="mb-1 text-sm text-zinc-500">
                        Most Overvalued Outcome
                      </div>
                      <div className="mb-4 text-base font-medium text-zinc-200">
                        {s.outcome_team}
                      </div>

                      <div className="mb-4 text-3xl font-semibold text-red-400">
                        {formatEV(s.expected_value)}
                      </div>

                      <div className="mb-5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${signalClasses(
                            s.signal
                          )}`}
                        >
                          {s.signal}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-zinc-500">
                        <div>
                          Confidence:{" "}
                          {formatScore(
                            s.confidence_label,
                            s.confidence_score,
                            "Unrated"
                          )}
                        </div>
                        <div>
                          Liquidity:{" "}
                          {formatScore(
                            s.liquidity_label,
                            s.liquidity_score,
                            "Unknown"
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {scoreGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setScoreGuideOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-white/8 bg-zinc-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setScoreGuideOpen(false)}
              className="absolute right-4 top-4 text-lg text-zinc-500 transition hover:text-white"
              aria-label="Close score guide"
            >
              ×
            </button>

            <div className="pr-8">
              <h2 className="text-xl font-semibold text-white">
                How scoring works
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Confidence and Liquidity are internal 0–10 scores.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-zinc-200">
                    Confidence
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">
                    How trustworthy the edge looks.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    0–2.4 Very Low
                    <br />
                    2.5–4.4 Low
                    <br />
                    4.5–6.4 Moderate
                    <br />
                    6.5–8.4 High
                    <br />
                    8.5–10 Very High
                  </p>
                </div>

                <div>
                  <div className="text-sm font-medium text-zinc-200">
                    Liquidity
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">
                    How easy the market is to trade.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    0–2.4 Very Thin
                    <br />
                    2.5–4.4 Thin
                    <br />
                    4.5–6.4 Tradable
                    <br />
                    6.5–8.4 Liquid
                    <br />
                    8.5–10 Deep
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}