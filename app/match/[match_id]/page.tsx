import EVChart from "@/app/components/EVChart";
import ProbabilityChart from "@/app/components/ProbabilityChart";
import Link from "next/link";

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

  const [historyResponse, detailResponse] = await Promise.all([
    fetch(
      `http://localhost:8000/kalshi/fifa/match/${match_id}/history?hours=${windowHours}`,
      { cache: "no-store" }
    ),
    fetch(
      `http://localhost:8000/kalshi/fifa/match/${match_id}`,
      { cache: "no-store" }
    ),
  ]);

  const historyData = await historyResponse.json();
  const detailData = await detailResponse.json();

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

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-6 py-8 md:px-8">
      <div className="mb-2">
        <Link
          href="/fifa"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition px-3 py-1.5 rounded-md hover:bg-zinc-800/60 backdrop-blur"
        >
          <span className="text-lg">←</span>
          Back to Markets
        </Link>
      </div>

      {best && (
        <div className="text-center mb-2">
          <div className="text-[10px] text-zinc-500 tracking-widest uppercase">
            Best Opportunity
          </div>

          {hasPositive ? (
            <div className="text-lg font-semibold text-emerald-400">
              {best.team} ({formatEV(best.value)})
            </div>
          ) : (
            <div className="text-lg font-semibold text-red-400">
              No Trade Opportunity
            </div>
          )}
        </div>
      )}

      {lastTime && (
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>

          <span className="text-zinc-400">LIVE</span>
          <span className="text-zinc-600">•</span>
          <span>Last updated: {lastTime} CST</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px_1fr] lg:items-start">
        {/* LEFT TEAM */}
        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {teamA}
          </h2>

          <div
            className={`mt-1 text-sm font-semibold tracking-wide ${
              latestA?.expected_value > 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {latestA?.expected_value > 0
              ? "BUY (Undervalued)"
              : "AVOID (Overvalued)"}
          </div>

          {latestA && (
            <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between border-b border-zinc-800 pb-2 text-zinc-400">
                <span>Kalshi</span>
                <span className="text-zinc-200">
                  {formatProb(latestA.ask_probability)}
                </span>
              </div>

              <div className="flex justify-between border-b border-zinc-800 pb-2 text-zinc-400">
                <span>Fair</span>
                <span className="text-zinc-200">
                  {formatProb(latestA.sportsbook_fair_probability)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">EV</span>
                <span
                  className={
                    latestA.expected_value > 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {formatEV(latestA.expected_value)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* DRAW / TIE */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Third Outcome
          </div>

          <h3 className="mt-2 text-2xl font-semibold text-white">
            {drawLabel ?? "Draw"}
          </h3>

          {latestDraw ? (
            <>
              <div
                className={`mt-3 text-sm font-semibold tracking-wide ${
                  latestDraw.expected_value > 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {latestDraw.expected_value > 0
                  ? "BUY (Undervalued)"
                  : "AVOID (Overvalued)"}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between border-b border-zinc-800 pb-2 text-zinc-400">
                  <span>Kalshi</span>
                  <span className="text-zinc-200">
                    {formatProb(latestDraw.ask_probability)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-zinc-800 pb-2 text-zinc-400">
                  <span>Fair</span>
                  <span className="text-zinc-200">
                    {formatProb(latestDraw.sportsbook_fair_probability)}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>EV</span>
                  <span
                    className={
                      latestDraw.expected_value > 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {formatEV(latestDraw.expected_value)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 text-sm text-zinc-500">
              No draw market data available.
            </div>
          )}
        </div>

        {/* RIGHT TEAM */}
        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 lg:text-right">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {teamB}
          </h2>

          <div
            className={`mt-1 text-sm font-semibold tracking-wide ${
              latestB?.expected_value > 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {latestB?.expected_value > 0
              ? "BUY (Undervalued)"
              : "AVOID (Overvalued)"}
          </div>

          {latestB && (
            <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between border-b border-zinc-800 pb-2 text-zinc-400 lg:flex-row-reverse">
                <span>Kalshi</span>
                <span className="text-zinc-200">
                  {formatProb(latestB.ask_probability)}
                </span>
              </div>

              <div className="flex justify-between border-b border-zinc-800 pb-2 text-zinc-400 lg:flex-row-reverse">
                <span>Fair</span>
                <span className="text-zinc-200">
                  {formatProb(latestB.sportsbook_fair_probability)}
                </span>
              </div>

              <div className="flex justify-between lg:flex-row-reverse">
                <span className="text-zinc-400">EV</span>
                <span
                  className={
                    latestB.expected_value > 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {formatEV(latestB.expected_value)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <div className="text-xs text-zinc-300 text-left mb-1">
          Expected Value Trend
        </div>

        <div className="flex justify-center gap-6 text-sm text-zinc-400 mt-4">
          <a
            href={`/match/${match_id}?hours=6`}
            className={windowHours === "6" ? "text-white font-semibold" : "hover:text-white"}
          >
            6H
          </a>

          <a
            href={`/match/${match_id}?hours=24`}
            className={windowHours === "24" ? "text-white font-semibold" : "hover:text-white"}
          >
            24H
          </a>

          <a
            href={`/match/${match_id}?hours=72`}
            className={windowHours === "72" ? "text-white font-semibold" : "hover:text-white"}
          >
            3D
          </a>

          <a
            href={`/match/${match_id}?hours=168`}
            className={windowHours === "168" ? "text-white font-semibold" : "hover:text-white"}
          >
            7D
          </a>

          <a
            href={`/match/${match_id}?hours=9999`}
            className={windowHours === "9999" ? "text-white font-semibold" : "hover:text-white"}
          >
            ALL
          </a>
        </div>

        <div className="h-[280px] md:h-[320px] mt-4">
          <EVChart
            teamAData={teamAData}
            teamBData={teamBData}
            teamA={teamA}
            teamB={teamB}
          />
        </div>
      </div>

      {(latestA || latestDraw || latestB) && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {latestA && (
            <div>
              <h3 className="text-lg font-semibold mb-6">{teamA} Market Data</h3>

              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Spread</span>
                  <span>{(latestA.expected_value * 100).toFixed(2)}%</span>
                </div>

                <div className="flex justify-between">
                  <span>Signal</span>
                  <span>{latestA.signal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Liquidity</span>
                  <span>{latestA.liquidity_score?.toFixed(2) ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Confidence</span>
                  <span>{latestA.confidence_score?.toFixed(2) ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Bid</span>
                  <span>
                    {latestA.bid_probability != null
                      ? (latestA.bid_probability * 100).toFixed(1) + "%"
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Ask</span>
                  <span>
                    {latestA.ask_probability != null
                      ? (latestA.ask_probability * 100).toFixed(1) + "%"
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Volume</span>
                  <span>{latestA.volume ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Open Interest</span>
                  <span>{latestA.open_interest ?? "-"}</span>
                </div>
              </div>
            </div>
          )}

          {latestDraw && drawLabel && (
            <div>
              <h3 className="text-lg font-semibold mb-6">{drawLabel} Market Data</h3>

              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Spread</span>
                  <span>{(latestDraw.expected_value * 100).toFixed(2)}%</span>
                </div>

                <div className="flex justify-between">
                  <span>Signal</span>
                  <span>{latestDraw.signal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Liquidity</span>
                  <span>{latestDraw.liquidity_score?.toFixed(2) ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Confidence</span>
                  <span>{latestDraw.confidence_score?.toFixed(2) ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Bid</span>
                  <span>
                    {latestDraw.bid_probability != null
                      ? (latestDraw.bid_probability * 100).toFixed(1) + "%"
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Ask</span>
                  <span>
                    {latestDraw.ask_probability != null
                      ? (latestDraw.ask_probability * 100).toFixed(1) + "%"
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Volume</span>
                  <span>{latestDraw.volume ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Open Interest</span>
                  <span>{latestDraw.open_interest ?? "-"}</span>
                </div>
              </div>
            </div>
          )}

          {latestB && (
            <div>
              <h3 className="text-lg font-semibold mb-6">{teamB} Market Data</h3>

              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Spread</span>
                  <span>{(latestB.expected_value * 100).toFixed(2)}%</span>
                </div>

                <div className="flex justify-between">
                  <span>Signal</span>
                  <span>{latestB.signal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Liquidity</span>
                  <span>{latestB.liquidity_score?.toFixed(2) ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Confidence</span>
                  <span>{latestB.confidence_score?.toFixed(2) ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Bid</span>
                  <span>
                    {latestB.bid_probability != null
                      ? (latestB.bid_probability * 100).toFixed(1) + "%"
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Ask</span>
                  <span>
                    {latestB.ask_probability != null
                      ? (latestB.ask_probability * 100).toFixed(1) + "%"
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Volume</span>
                  <span>{latestB.volume ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Open Interest</span>
                  <span>{latestB.open_interest ?? "-"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {teamAData.length > 0 && teamBData.length > 0 && (
        <div className="mt-16 max-w-6xl mx-auto w-full">
          <h2 className="text-lg font-semibold mb-6 text-zinc-300">
            Probability Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm text-zinc-400 mb-2">{teamA}</h3>
              <ProbabilityChart data={teamAData} latestEV={latestA?.expected_value} />
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm text-zinc-400 mb-2">{teamB}</h3>
              <ProbabilityChart data={teamBData} latestEV={latestB?.expected_value} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}