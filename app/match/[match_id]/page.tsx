import EVChart from "@/app/components/EVChart";
import ProbabilityChart from "@/app/components/ProbabilityChart";

export default async function MatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ match_id: string }>;
  searchParams: Promise<{ hours?: string }>;
}){
  const { match_id } = await params;
  const { hours } = await searchParams;

  const windowHours = hours ?? "6";

  const response = await fetch(
    `http://localhost:8000/kalshi/fifa/match/${match_id}/history?hours=${windowHours}`
  );

  const data = await response.json();

    const teams = Object.keys(data.teams);

    let teamAData: any[] = [];
    let teamBData: any[] = [];

    if (teams.length >= 2) {
    const teamA = data.teams[teams[0]];
    const teamB = data.teams[teams[1]];

    teamAData = teamA.map((row: any) => ({
        time: new Date(row.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
        }),
        kalshi: row.ask_probability,
        fair: row.fair_probability,
        ev: row.expected_value
    }));

    teamBData = teamB.map((row: any) => ({
        time: new Date(row.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
        }),
        kalshi: row.ask_probability,
        fair: row.fair_probability,
        ev: row.expected_value
    }));
    }

  return (
  <div className="p-10 space-y-10">

    <h1 className="text-3xl font-bold">
      Match ID: {match_id}
    </h1>
    <div className="flex gap-2 mb-6">
    <a href={`?hours=6`} className="px-3 py-1 bg-zinc-800 rounded">
        6h
    </a>

    <a href={`?hours=24`} className="px-3 py-1 bg-zinc-800 rounded">
        24h
    </a>

    <a href={`?hours=48`} className="px-3 py-1 bg-zinc-800 rounded">
        2d
    </a>

    <a href={`?hours=168`} className="px-3 py-1 bg-zinc-800 rounded">
        7d
    </a>

    <a href={`?hours=9999`} className="px-3 py-1 bg-zinc-800 rounded">
        All
    </a>
    </div>
    {/* Probability Charts */}

    {teams[0] && (
      <div>
        <h2 className="text-xl font-semibold mb-2">
          {teams[0]} Probability
        </h2>
        <ProbabilityChart data={teamAData} />
      </div>
    )}

    {teams[1] && (
      <div>
        <h2 className="text-xl font-semibold mb-2">
          {teams[1]} Probability
        </h2>
        <ProbabilityChart data={teamBData} />
      </div>
    )}

    {/* EV Chart */}

    <div>
      <h2 className="text-xl font-semibold mb-2">
        Expected Value Over Time
      </h2>
      <EVChart data={teamAData} />
    </div>

  </div>
);
}