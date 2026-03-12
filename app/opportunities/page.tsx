import Link from "next/link";

export default async function OpportunitiesPage() {
  const res = await fetch(
    "http://localhost:8000/kalshi/fifa/top-signals",
    { cache: "no-store" }
  );

  const data = await res.json();

  const signals = data.top_signals ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      <h1 className="text-3xl font-bold mb-8">
        Top EV Opportunities
      </h1>

      <div className="border border-zinc-800 rounded-lg overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-5 bg-zinc-900 text-sm text-zinc-400 px-4 py-3">
          <div>Match</div>
          <div>Team</div>
          <div>EV</div>
          <div>Confidence</div>
          <div>Liquidity</div>
        </div>

        {/* ROWS */}
        {signals.map((s: any) => (
          <Link
            key={`${s.match_id}-${s.team}`}
            href={`/match/${s.match_id}`}
            className="grid grid-cols-5 px-4 py-3 border-t border-zinc-800 hover:bg-zinc-900"
          >
            <div>{s.match}</div>

            <div>{s.team}</div>

            <div
              className={
                s.expected_value > 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            >
              {(s.expected_value * 100).toFixed(2)}%
            </div>

            <div>{s.confidence_score?.toFixed(2)}</div>

            <div>{s.liquidity_score?.toFixed(2)}</div>
          </Link>
        ))}

      </div>

    </div>
  );
}