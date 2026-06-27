// Central API client.
// In dev, NEXT_PUBLIC_API_URL comes from .env.local (http://localhost:8000).
// In production, it's set in Vercel (https://api.smitp.dev).
// The fallback to localhost keeps `npm run dev` working even if .env.local is missing.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Supported sports. Add new sports here as the backend gains them
// (the backend SPORTS_CONFIG is the source of truth; this mirrors it for
// type safety on the frontend).
export type Sport = "fifa" | "mlb";

export const DEFAULT_SPORT: Sport = "fifa";

export async function fetchMatches(sport: Sport = DEFAULT_SPORT) {
  const res = await fetch(`${API_BASE}/kalshi/${sport}/matches`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${sport} matches`);
  }

  const data = await res.json();
  return data.matches || [];
}

export async function fetchMatchHistory(
  matchId: string,
  hours: number,
  sport: Sport = DEFAULT_SPORT,
) {
  const res = await fetch(
    `${API_BASE}/kalshi/${sport}/match/${matchId}/history?hours=${hours}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch ${sport} match history`);
  }

  const data = await res.json();
  return data.teams;
}

export async function fetchEvMovers(hours = 6, sport: Sport = DEFAULT_SPORT) {
  const res = await fetch(
    `${API_BASE}/kalshi/${sport}/ev-movers?hours=${hours}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch ${sport} EV movers`);
  }

  const data = await res.json();
  return data.movers ?? [];
}

export async function fetchOpportunities(sport: Sport = DEFAULT_SPORT) {
  const res = await fetch(`${API_BASE}/kalshi/${sport}/opportunities`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${sport} opportunities`);
  }

  return res.json();
}

export async function fetchMatchDetail(
  matchId: string,
  hours: string | number,
  sport: Sport = DEFAULT_SPORT,
) {
  const [historyResponse, detailResponse] = await Promise.all([
    fetch(
      `${API_BASE}/kalshi/${sport}/match/${matchId}/history?hours=${hours}`,
      { cache: "no-store" },
    ),
    fetch(`${API_BASE}/kalshi/${sport}/match/${matchId}`, {
      cache: "no-store",
    }),
  ]);

  const historyData = await historyResponse.json();
  const detailData = await detailResponse.json();

  return { historyData, detailData };
}
