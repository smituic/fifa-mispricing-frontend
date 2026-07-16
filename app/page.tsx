import Link from "next/link";
import { SPORTS, STATUS_LABELS, STATUS_STYLES } from "@/lib/sports";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 md:px-8">
      <div className="max-w-4xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
          Prediction Market Intelligence
        </div>

        <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
          Spot prediction market mispricings across sports.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          A dark, decision-first dashboard for monitoring Kalshi markets,
          ranking live opportunities, and tracking how expected value moves over
          time. Pick a sport to get started.
        </p>
      </div>

      <div className="mt-16">
        <div className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Select a sport
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SPORTS.map((sport) => {
            const isLive = sport.status === "live";
            // Archived sports have no live markets but do have stored history,
            // so their pages stay reachable — just badged differently.
            const isArchive = sport.status === "archive";
            const isOpenable = isLive || isArchive;
            const badge = (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${
                  STATUS_STYLES[sport.status]
                }`}
              >
                {isLive && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                )}
                {STATUS_LABELS[sport.status]}
              </span>
            );

            const cardInner = (
              <div
                className={`group relative flex h-full flex-col rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur transition ${
                  isOpenable
                    ? "hover:border-white/20 hover:bg-white/[0.08] cursor-pointer"
                    : "opacity-60"
                }`}
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl">
                    {sport.icon}
                  </div>
                  {badge}
                </div>

                <h2 className="text-xl font-semibold text-white">
                  {sport.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {sport.tagline}
                </p>

                {sport.statusDetail && (
                  <p className="mt-4 text-xs uppercase tracking-[0.14em] text-zinc-500">
                    {sport.statusDetail}
                  </p>
                )}

                <div className="mt-6 flex items-center text-sm font-medium">
                  {isLive ? (
                    <span className="text-white group-hover:translate-x-0.5 transition-transform">
                      Open {sport.shortName} →
                    </span>
                  ) : isArchive ? (
                    <span className="text-blue-300 group-hover:translate-x-0.5 transition-transform">
                      View archive →
                    </span>
                  ) : (
                    <span className="text-zinc-500">Not available yet</span>
                  )}
                </div>
              </div>
            );

            return isOpenable ? (
              <Link key={sport.key} href={`/sport/${sport.key}`}>
                {cardInner}
              </Link>
            ) : (
              <div key={sport.key}>{cardInner}</div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
