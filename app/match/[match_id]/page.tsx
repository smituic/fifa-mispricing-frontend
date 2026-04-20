import EVChart from "@/app/components/EVChart";
import ProbabilityChart from "@/app/components/ProbabilityChart";
import TopNav from "@/app/components/TopNav";
import Link from "next/link";
import { fetchMatchDetail } from "@/lib/api";

export default async function MatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ match_id: string }>;
  searchParams: Promise<{ hours?: string }>;
}) {
  const { match_id } = await params;
  const { hours } = await searchParams;

  const windowHours = hours ?? "6";

  const { historyData, detailData } = await fetchMatchDetail(match_id, windowHours);
  
  let teamA = "";
  let teamB = "";

  const historyTeamNames = Object.keys(historyData.teams ?? {});

  if (detailData?.match_title && detailData.match_title.includes(" vs ")) {
    [teamA, teamB] = detailData.match_title.split(" vs ");
  } else if (historyTeamNames.length >= 2) {
    teamA = historyTeamNames[0];
    teamB = historyTeamNames[1];
  }

  const kalshiOutcomes = detailData?.kalshi?.outcomes ?? [];
  const analysisOutcomes = detailData?.analysis?.outcomes ?? [];

  const currentByTeam: Record<string, any> = {};

  for (const outcome of analysisOutcomes) {
    const kalshiData = kalshiOutcomes.find((k: any) => {
      if (k.team === outcome.team) return true;
      if (k.team === "Tie" && outcome.team === "Draw") return true;
      if (k.team === "Draw" && outcome.team === "Tie") return true;
      return false;
    });

    currentByTeam[outcome.team] = {
      ...outcome,
      ask_probability: kalshiData?.implied_ask_prob ?? null,
      bid_probability: kalshiData?.implied_bid_prob ?? null,
      mid_price: kalshiData?.mid_price ?? null,
      volume: kalshiData?.volume ?? null,
      open_interest: kalshiData?.open_interest ?? null,
    };
  }

  const drawLabel = currentByTeam["Draw"]
    ? "Draw"
    : currentByTeam["Tie"]
    ? "Tie"
    : null;

  const latestA = teamA ? currentByTeam[teamA] ?? null : null;
  const latestB = teamB ? currentByTeam[teamB] ?? null : null;
  const latestDraw = drawLabel ? currentByTeam[drawLabel] ?? null : null;

  let teamAData: any[] = [];
  let teamBData: any[] = [];

  if (teamA && teamB && historyData?.teams) {
    const teamAHistory = historyData.teams[teamA] ?? [];
    const teamBHistory = historyData.teams[teamB] ?? [];

    teamAData = teamAHistory.map((row: any) => {
      const kalshi = row.ask_probability;
      const fair = row.fair_probability;

      return {
        time: new Date(row.timestamp + "Z").toLocaleTimeString("en-US", {
          hour: "2-digit",
          hour12: false,
          minute: "2-digit",
          timeZone: "America/Chicago",
        }),
        kalshi,
        fair,
        lower: Math.min(kalshi, fair),
        upper: Math.max(kalshi, fair),
        ev: row.expected_value,
      };
    });

    teamBData = teamBHistory.map((row: any) => {
      const kalshi = row.ask_probability;
      const fair = row.fair_probability;

      return {
        time: new Date(row.timestamp + "Z").toLocaleTimeString("en-US", {
          hour: "2-digit",
          hour12: false,
          minute: "2-digit",
          timeZone: "America/Chicago",
        }),
        kalshi,
        fair,
        lower: Math.min(kalshi, fair),
        upper: Math.max(kalshi, fair),
        ev: row.expected_value,
      };
    });
  }

  function formatProb(value: number | null | undefined) {
    if (value == null) return "-";
    return `${(value * 100).toFixed(0)}%`;
  }

  function formatEV(value: number | null | undefined) {
    if (value == null) return "-";
    const sign = value > 0 ? "+" : "";
    return `${sign}${(value * 100).toFixed(1)}%`;
  }

  function formatScore(
    label: string | null | undefined,
    score: number | null | undefined,
    fallback: string
  ) {
    return `${label ?? fallback} (${((score ?? 0) as number).toFixed(1)} / 10)`;
  }

  function signalTone(value: number | null | undefined) {
    return (value ?? 0) > 0 ? "text-emerald-400" : "text-red-400";
  }

  function signalText(value: number | null | undefined) {
    return (value ?? 0) > 0 ? "BUY (Undervalued)" : "AVOID (Overvalued)";
  }

  const allCurrentOutcomes = [
    latestA && { team: teamA, value: latestA.expected_value },
    latestDraw && drawLabel && { team: drawLabel, value: latestDraw.expected_value },
    latestB && { team: teamB, value: latestB.expected_value },
  ].filter(Boolean) as { team: string; value: number }[];

  const best =
    allCurrentOutcomes.length > 0
      ? allCurrentOutcomes.reduce((best, curr) =>
          curr.value > best.value ? curr : best
        )
      : null;

  const hasPositive = best && best.value > 0;

  const lastTime =
    teamAData.length > 0 ? teamAData[teamAData.length - 1].time : null;

  function MarketDetailCard({
    title,
    data,
  }: {
    title: string;
    data: any;
  }) {
    if (!data) return null;

    return (
      <div className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur">
        <h3 className="mb-5 text-xl font-semibold text-white">{title}</h3>

        <div className="space-y-6 text-sm">
          <div>
            <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Pricing
            </div>
            <div className="space-y-3 text-zinc-400">
              <div className="flex justify-between">
                <span>Edge</span>
                <span className="text-zinc-200">
                  {(data.expected_value * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Signal</span>
                <span className="text-zinc-200">{data.signal}</span>
              </div>
              <div className="flex justify-between">
                <span>Bid</span>
                <span className="text-zinc-200">
                  {data.bid_probability != null
                    ? (data.bid_probability * 100).toFixed(1) + "%"
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ask</span>
                <span className="text-zinc-200">
                  {data.ask_probability != null
                    ? (data.ask_probability * 100).toFixed(1) + "%"
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 pt-5">
            <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Quality
            </div>
            <div className="space-y-3 text-zinc-400">
              <div className="flex justify-between gap-4">
                <span>Confidence</span>
                <span className="text-right text-zinc-200">
                  {formatScore(data.confidence_label, data.confidence_score, "Unrated")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Liquidity</span>
                <span className="text-right text-zinc-200">
                  {formatScore(data.liquidity_label, data.liquidity_score, "Unknown")}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 pt-5">
            <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Execution
            </div>
            <div className="space-y-3 text-zinc-400">
              <div className="flex justify-between">
                <span>Volume</span>
                <span className="text-zinc-200">{data.volume ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Open Interest</span>
                <span className="text-zinc-200">{data.open_interest ?? "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            href="/fifa"
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
          >
            ← Back to Markets
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <details className="group">
              <summary className="cursor-pointer list-none rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-zinc-400 transition hover:border-white/15 hover:text-white">
                How scoring works
              </summary>
              <div className="absolute z-20 mt-3 w-[320px] rounded-2xl border border-white/8 bg-zinc-950/95 p-4 text-sm leading-6 text-zinc-400 shadow-2xl backdrop-blur">
                <div className="mb-2 font-medium text-white">Score guide</div>
                <div>
                  <span className="text-zinc-200">Confidence</span> measures how trustworthy the edge looks.
                </div>
                <div className="mt-2">
                  <span className="text-zinc-200">Liquidity</span> measures how easy the market is to trade.
                </div>
                <div className="mt-3 text-zinc-500">
                  Both are internal 0–10 scores.
                </div>
              </div>
            </details>

            {lastTime && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                </span>
                <span className="text-zinc-400">LIVE</span>
                <span>Last updated: {lastTime} CST</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
            Match Detail
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {teamA} vs {teamB}
          </h1>

          {best && (
            <p className="mt-3 text-base leading-7 text-zinc-400 md:text-lg">
              {hasPositive ? (
                <>
                  Best current opportunity:{" "}
                  <span className="font-semibold text-emerald-400">
                    {best.team} ({formatEV(best.value)})
                  </span>
                </>
              ) : (
                <span className="font-semibold text-red-400">
                  No strong trade opportunity right now.
                </span>
              )}
            </p>
          )}
        </div>

        <div className="mb-10 rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                EV Trend
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  <span>{teamA}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span>{teamB}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {[
                { label: "6H", value: "6" },
                { label: "24H", value: "24" },
                { label: "3D", value: "72" },
                { label: "7D", value: "168" },
                { label: "ALL", value: "9999" },
              ].map((option) => (
                <a
                  key={option.value}
                  href={`/match/${match_id}?hours=${option.value}`}
                  className={`rounded-2xl border px-4 py-2 font-medium transition ${
                    windowHours === option.value
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {option.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-5 w-full">
            <EVChart
              teamAData={teamAData}
              teamBData={teamBData}
              teamA={teamA}
              teamB={teamB}
            />
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px_1fr]">
          <div className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm uppercase tracking-[0.18em] text-zinc-500">
              Home Outcome
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white">{teamA}</h2>

            <div className={`mt-3 text-sm font-semibold ${signalTone(latestA?.expected_value)}`}>
              {signalText(latestA?.expected_value)}
            </div>

            {latestA && (
              <>
                <div className={`mt-4 text-4xl font-semibold ${signalTone(latestA.expected_value)}`}>
                  {formatEV(latestA.expected_value)}
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/8 pb-3 text-zinc-400">
                    <span>Kalshi</span>
                    <span className="text-zinc-200">{formatProb(latestA.ask_probability)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Fair</span>
                    <span className="text-zinc-200">
                      {formatProb(latestA.sportsbook_fair_probability)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/5 p-6 text-center backdrop-blur">
            <div className="text-sm uppercase tracking-[0.18em] text-zinc-500">
              Third Outcome
            </div>

            <h3 className="mt-4 text-3xl font-semibold text-white">
              {drawLabel ?? "Draw"}
            </h3>

            {latestDraw ? (
              <>
                <div className={`mt-3 text-sm font-semibold ${signalTone(latestDraw.expected_value)}`}>
                  {signalText(latestDraw.expected_value)}
                </div>

                <div className={`mt-4 text-4xl font-semibold ${signalTone(latestDraw.expected_value)}`}>
                  {formatEV(latestDraw.expected_value)}
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/8 pb-3 text-zinc-400">
                    <span>Kalshi</span>
                    <span className="text-zinc-200">{formatProb(latestDraw.ask_probability)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Fair</span>
                    <span className="text-zinc-200">
                      {formatProb(latestDraw.sportsbook_fair_probability)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 text-sm text-zinc-500">
                No draw market data available.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur lg:text-right">
            <div className="text-sm uppercase tracking-[0.18em] text-zinc-500">
              Away Outcome
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white">{teamB}</h2>

            <div className={`mt-3 text-sm font-semibold ${signalTone(latestB?.expected_value)}`}>
              {signalText(latestB?.expected_value)}
            </div>

            {latestB && (
              <>
                <div className={`mt-4 text-4xl font-semibold ${signalTone(latestB.expected_value)}`}>
                  {formatEV(latestB.expected_value)}
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/8 pb-3 text-zinc-400 lg:flex-row-reverse">
                    <span>Kalshi</span>
                    <span className="text-zinc-200">{formatProb(latestB.ask_probability)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 lg:flex-row-reverse">
                    <span>Fair</span>
                    <span className="text-zinc-200">
                      {formatProb(latestB.sportsbook_fair_probability)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {(latestA || latestDraw || latestB) && (
          <div className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Market Intelligence</h2>
              <span className="text-sm text-zinc-500">
                Pricing, quality, and execution data
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <MarketDetailCard title={`${teamA} Market Data`} data={latestA} />
              <MarketDetailCard title={`${drawLabel ?? "Draw"} Market Data`} data={latestDraw} />
              <MarketDetailCard title={`${teamB} Market Data`} data={latestB} />
            </div>
          </div>
        )}

        {teamAData.length > 0 && teamBData.length > 0 && (
          <div className="mt-4">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Probability Analysis
              </h2>
              <span className="text-sm text-zinc-500">
                Kalshi versus fair probability over time
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
                <h3 className="mb-3 text-sm uppercase tracking-[0.18em] text-zinc-500">
                  {teamA}
                </h3>
                <ProbabilityChart
                  data={teamAData}
                  latestEV={latestA?.expected_value}
                />
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur">
                <h3 className="mb-3 text-sm uppercase tracking-[0.18em] text-zinc-500">
                  {teamB}
                </h3>
                <ProbabilityChart
                  data={teamBData}
                  latestEV={latestB?.expected_value}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}