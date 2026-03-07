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

  return (

    <div className="p-10 space-y-16 max-w-6xl mx-auto">

      {/* TEAM + EV CHART SECTION */}

      <div className="grid grid-cols-3 items-center gap-8">

        {/* LEFT TEAM */}

        <div className="text-left">

          <h2 className="text-3xl font-bold">
            {teamA}
          </h2>

          {latestA && (
            <div className="text-sm text-gray-400 mt-3 space-y-1">

              <div>
                Kalshi: {latestA.ask_probability.toFixed(2)}
              </div>

              <div>
                Fair: {latestA.fair_probability.toFixed(2)}
              </div>

              <div
                className={
                  latestA.expected_value > 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                EV: {latestA.expected_value.toFixed(2)}
              </div>

            </div>
          )}

        </div>


        {/* CENTER EV CHART */}

        <div className="h-[280px]">

          <EVChart
            teamAData={teamAData}
            teamBData={teamBData}
            teamA={teamA}
            teamB={teamB}
          />

        </div>


        {/* RIGHT TEAM */}

        <div className="text-right">

          <h2 className="text-3xl font-bold">
            {teamB}
          </h2>

          {latestB && (
            <div className="text-sm text-gray-400 mt-3 space-y-1">

              <div>
                Kalshi: {latestB.ask_probability.toFixed(2)}
              </div>

              <div>
                Fair: {latestB.fair_probability.toFixed(2)}
              </div>

              <div
                className={
                  latestB.expected_value > 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                EV: {latestB.expected_value.toFixed(2)}
              </div>

            </div>
          )}

        </div>

      </div>


      {/* TEAM A PROBABILITY */}

      {teamA && (

        <div>

          <h2 className="text-xl font-semibold mb-3">
            {teamA} Probability
          </h2>

          <ProbabilityChart data={teamAData} />

        </div>

      )}


      {/* TEAM B PROBABILITY */}

      {teamB && (

        <div>

          <h2 className="text-xl font-semibold mb-3">
            {teamB} Probability
          </h2>

          <ProbabilityChart data={teamBData} />

        </div>

      )}

    </div>

  );

}