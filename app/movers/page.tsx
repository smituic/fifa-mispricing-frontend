"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchEvMovers } from "../../lib/api";
import TopNav from "../components/TopNav";

type EvMover = {
  match_id: string;
  match: string;
  team: string;
  ev_change: number;
};

function formatWindowLabel(hours: number) {
  if (hours === 6) return "6H";
  if (hours === 24) return "24H";
  if (hours === 72) return "3D";
  if (hours === 168) return "7D";
  return `${hours}H`;
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

function cleanMatchTitle(match: string) {
  return match
    .split(" vs ")
    .filter((part) => part !== "Draw" && part !== "Tie")
    .join(" vs ");
}

function outcomeBadgeClasses(value: number) {
  return value > 0
    ? "border border-emerald-400/15 bg-emerald-500/10 text-emerald-400"
    : "border border-red-400/15 bg-red-500/10 text-red-400";
}

function moveTextClasses(value: number) {
  return value > 0 ? "text-emerald-400" : "text-red-400";
}

function Arrow({ value }: { value: number }) {
  return <span>{value > 0 ? "↑" : "↓"}</span>;
}

export default function EvMovers() {
  const [movers, setMovers] = useState<EvMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(24);

  useEffect(() => {
    setLoading(true);

    fetchEvMovers(hours)
      .then((data) => {
        setMovers(data ?? []);
      })
      .catch((err) => {
        console.error("Failed to fetch EV movers:", err);
        setMovers([]);
      })
      .finally(() => setLoading(false));
  }, [hours]);

  const { upwardMovers, downwardMovers, topUp, topDown } = useMemo(() => {
    const enhanced = (movers ?? []).map((m) => ({
      ...m,
      clean_match: cleanMatchTitle(m.match),
    }));

    const up = enhanced
      .filter((m) => m.ev_change > 0)
      .sort((a, b) => b.ev_change - a.ev_change);

    const down = enhanced
      .filter((m) => m.ev_change < 0)
      .sort((a, b) => a.ev_change - b.ev_change);

    return {
      upwardMovers: up,
      downwardMovers: down,
      topUp: up[0] ?? null,
      topDown: down[0] ?? null,
    };
  }, [movers]);

  return (
    <>
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
              Momentum View
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              EV Movers
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              See which outcomes are gaining or losing expected value fastest
              across your selected time window.
            </p>
          </div>

          <Link
            href="/fifa"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
          >
            ← Back to Markets
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {[6, 24, 72, 168].map((h) => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                hours === h
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
              }`}
            >
              {formatWindowLabel(h)}
            </button>
          ))}
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Biggest Up Move
            </div>
            <div className="mt-3 text-lg font-semibold text-emerald-400">
              {topUp
                ? `${topUp.clean_match} · ${topUp.team} (${formatPercent(
                    topUp.ev_change
                  )})`
                : "No upward movers"}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Biggest Down Move
            </div>
            <div className="mt-3 text-lg font-semibold text-red-400">
              {topDown
                ? `${topDown.clean_match} · ${topDown.team} (${formatPercent(
                    topDown.ev_change
                  )})`
                : "No downward movers"}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Window
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {formatWindowLabel(hours)}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/8 bg-white/5 p-8 text-sm text-zinc-400 backdrop-blur">
            Loading EV movers...
          </div>
        ) : (
          <>
            <section className="mb-16">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">
                  Upward Movers
                </h2>
                <span className="text-sm text-zinc-500">
                  EV increasing fastest
                </span>
              </div>

              {upwardMovers.length === 0 ? (
                <div className="rounded-3xl border border-white/8 bg-white/5 p-8 text-sm text-zinc-400 backdrop-blur">
                  No upward movers in this window.
                </div>
              ) : (
                <div className="space-y-4">
                  {upwardMovers.map((m) => (
                    <Link
                      key={`${m.match_id}-${m.team}-up`}
                      href={`/match/${m.match_id}`}
                      className="group block rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-2xl font-semibold text-white">
                            {m.clean_match}
                          </h3>

                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-sm text-zinc-500">
                              Moving Outcome
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${outcomeBadgeClasses(
                                m.ev_change
                              )}`}
                            >
                              {m.team}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div
                            className={`text-right text-3xl font-semibold ${moveTextClasses(
                              m.ev_change
                            )}`}
                          >
                            <Arrow value={m.ev_change} /> {formatPercent(m.ev_change)}
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
            </section>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">
                  Downward Movers
                </h2>
                <span className="text-sm text-zinc-500">
                  EV falling fastest
                </span>
              </div>

              {downwardMovers.length === 0 ? (
                <div className="rounded-3xl border border-white/8 bg-white/5 p-8 text-sm text-zinc-400 backdrop-blur">
                  No downward movers in this window.
                </div>
              ) : (
                <div className="space-y-4">
                  {downwardMovers.map((m) => (
                    <Link
                      key={`${m.match_id}-${m.team}-down`}
                      href={`/match/${m.match_id}`}
                      className="group block rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-2xl font-semibold text-white">
                            {m.clean_match}
                          </h3>

                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-sm text-zinc-500">
                              Moving Outcome
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${outcomeBadgeClasses(
                                m.ev_change
                              )}`}
                            >
                              {m.team}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div
                            className={`text-right text-3xl font-semibold ${moveTextClasses(
                              m.ev_change
                            )}`}
                          >
                            <Arrow value={m.ev_change} /> {formatPercent(m.ev_change)}
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
            </section>
          </>
        )}
      </main>
    </>
  );
}