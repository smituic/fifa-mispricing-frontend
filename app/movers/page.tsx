"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchEvMovers } from "../../lib/api";

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
    ? "bg-emerald-500/10 text-emerald-400"
    : "bg-red-500/10 text-red-400";
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
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            EV Movers
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Largest expected value changes over the selected time window.
          </p>
        </div>

        <Link
          href="/fifa"
          className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white"
        >
          ← Back to Markets
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        {[6, 24, 72, 168].map((h) => (
          <button
            key={h}
            onClick={() => setHours(h)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              hours === h
                ? "border-zinc-200 bg-zinc-100 text-black"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white"
            }`}
          >
            {formatWindowLabel(h)}
          </button>
        ))}
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Biggest Up Move
          </div>
          <div className="mt-2 text-lg font-semibold text-emerald-400">
            {topUp
              ? `${topUp.clean_match} · ${topUp.team} (${formatPercent(
                  topUp.ev_change
                )})`
              : "No upward movers"}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Biggest Down Move
          </div>
          <div className="mt-2 text-lg font-semibold text-red-400">
            {topDown
              ? `${topDown.clean_match} · ${topDown.team} (${formatPercent(
                  topDown.ev_change
                )})`
              : "No downward movers"}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Window
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            Last {formatWindowLabel(hours)}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400">
          Loading EV movers...
        </div>
      ) : (
        <>
          <section className="mb-14">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Upward Movers
              </h2>
              <span className="text-sm text-zinc-500">
                EV increasing fastest
              </span>
            </div>

            {upwardMovers.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400">
                No upward movers in this window.
              </div>
            ) : (
              <div className="space-y-4">
                {upwardMovers.map((m) => (
                  <Link
                    key={`${m.match_id}-${m.team}-up`}
                    href={`/match/${m.match_id}`}
                    className="group block rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/80"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-semibold text-white">
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
                          className={`text-right text-2xl font-bold ${moveTextClasses(
                            m.ev_change
                          )}`}
                        >
                          <Arrow value={m.ev_change} /> {formatPercent(m.ev_change)}
                        </div>

                        <div className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-zinc-400">
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
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Downward Movers
              </h2>
              <span className="text-sm text-zinc-500">
                EV falling fastest
              </span>
            </div>

            {downwardMovers.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400">
                No downward movers in this window.
              </div>
            ) : (
              <div className="space-y-4">
                {downwardMovers.map((m) => (
                  <Link
                    key={`${m.match_id}-${m.team}-down`}
                    href={`/match/${m.match_id}`}
                    className="group block rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/80"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-semibold text-white">
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
                          className={`text-right text-2xl font-bold ${moveTextClasses(
                            m.ev_change
                          )}`}
                        >
                          <Arrow value={m.ev_change} /> {formatPercent(m.ev_change)}
                        </div>

                        <div className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-zinc-400">
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
  );
}