import EVChart from "@/app/components/EVChart";
import ProbabilityChart from "@/app/components/ProbabilityChart";

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

  const response = await fetch(
    `http://localhost:8000/kalshi/fifa/match/${match_id}/history?hours=${windowHours}`,
    { cache: "no-store" }
  );

  const data = await response.json();

  

  const teamNames = Object.keys(data.teams ?? {});

  let teamA = "";
  let teamB = "";

  let teamAData: any[] = [];
  let teamBData: any[] = [];

  let latestA: any = null;
  let latestB: any = null;

  if (teamNames.length >= 2) {
    teamA = teamNames[0];
    teamB = teamNames[1];

    const teamAHistory = data.teams[teamA];
    const teamBHistory = data.teams[teamB];

    latestA = teamAHistory[teamAHistory.length - 1];
    latestB = teamBHistory[teamBHistory.length - 1];



    teamAData = teamAHistory.map((row: any) => ({
      time: new Date(row.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      kalshi: row.ask_probability,
      fair: row.fair_probability,
      ev: row.expected_value,
    }));

    teamBData = teamBHistory.map((row: any) => ({
      time: new Date(row.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      kalshi: row.ask_probability,
      fair: row.fair_probability,
      ev: row.expected_value,
    }));
  }

  function formatProb(value: number) {
    return `${(value * 100).toFixed(0)}%`;
  }

  function formatEV(value: number) {
    const sign = value > 0 ? "+" : "";
    return `${sign}${(value * 100).toFixed(1)}%`;
  }

  return (
  <div className="mx-auto max-w-7xl space-y-20 px-6 py-8 md:px-8">

    {/* HEADER SECTION */}
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.4fr_1fr] lg:items-center">

      {/* LEFT TEAM */}
      <div className="space-y-3 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {teamA}
        </h2>

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
                {formatProb(latestA.fair_probability)}
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


      {/* EV CHART */}
      <div className="h-[280px] md:h-[320px] mt-10">
        {/* TIME FILTER */}
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
        <EVChart
          teamAData={teamAData}
          teamBData={teamBData}
          teamA={teamA}
          teamB={teamB}
        />
      </div>


      {/* RIGHT TEAM */}
      <div className="space-y-3 pt-6 lg:text-right">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {teamB}
        </h2>

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
                {formatProb(latestB.fair_probability)}
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


    {/* MARKET DATA SECTION */}
    {latestA && latestB && (
      <div className="grid grid-cols-2 gap-24 max-w-5xl mx-auto">

        {/* TEAM A MARKET DATA */}
        <div>
          <h3 className="text-lg font-semibold mb-6">{teamA} Market Data</h3>

          <div className="space-y-3 text-sm text-zinc-400">

            <div className="flex justify-between">
              <span>Spread</span>
              <span>{(latestA.expected_value * 100).toFixed(2)}%</span>
            </div>

            <div className="flex justify-between">
              <span>Signal</span>
              <span>
                {latestA.signal ??
                  (latestA.expected_value > 0
                    ? "Undervalued"
                    : "Overvalued")}
              </span>
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
                {latestA.bid_probability
                  ? (latestA.bid_probability * 100).toFixed(1) + "%"
                  : "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Ask</span>
              <span>
                {latestA.ask_probability
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


        {/* TEAM B MARKET DATA */}
        <div>
          <h3 className="text-lg font-semibold mb-6">{teamB} Market Data</h3>

          <div className="space-y-3 text-sm text-zinc-400">

            <div className="flex justify-between">
              <span>Spread</span>
              <span>{(latestB.expected_value * 100).toFixed(2)}%</span>
            </div>

            <div className="flex justify-between">
              <span>Signal</span>
              <span>
                {latestB.signal ??
                  (latestB.expected_value > 0
                    ? "Undervalued"
                    : "Overvalued")}
              </span>
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
                {latestB.bid_probability
                  ? (latestB.bid_probability * 100).toFixed(1) + "%"
                  : "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Ask</span>
              <span>
                {latestB.ask_probability
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

      </div>
    )}
    {/* PROBABILITY CHARTS */}
  {teamAData.length > 0 && teamBData.length > 0 && (
    <div className="mt-16 space-y-12 max-w-5xl mx-auto">

      {/* TEAM A */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-zinc-300">
          {teamA} Probability
        </h2>
        <ProbabilityChart
          data={teamAData}
          latestEV={latestA?.expected_value}
        />
      </div>

      {/* TEAM B */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-zinc-300">
          {teamB} Probability
        </h2>
        <ProbabilityChart
          data={teamBData}
          latestEV={latestB?.expected_value}
        />
      </div>

    </div>
  )}

  </div>
);}