// Central API client.
// In dev, NEXT_PUBLIC_API_URL comes from .env.local (http://localhost:8000).
// In production, it's set in Vercel (https://api.mispricing.smitp.dev).
// The fallback to localhost keeps `npm run dev` working even if .env.local is missing.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchMatches() {
  const res = await fetch(`${API_BASE}/kalshi/fifa/matches`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch matches");
  }

  const data = await res.json();
  return data.matches || [];
}

export async function fetchMatchHistory(matchId: string, hours: number) {
  const res = await fetch(
    `${API_BASE}/kalshi/fifa/match/${matchId}/history?hours=${hours}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch match history");
  }

  const data = await res.json();
  return data.teams;
}

export async function fetchEvMovers(hours = 6) {
  const res = await fetch(
    `${API_BASE}/kalshi/fifa/ev-movers?hours=${hours}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch EV movers");
  }

  const data = await res.json();
  return data.movers ?? [];
}

export async function fetchOpportunities() {
  const res = await fetch(`${API_BASE}/kalshi/fifa/opportunities`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch opportunities");
  }

  return res.json();
}

export async function fetchMatchDetail(matchId: string, hours: string | number) {
  const [historyResponse, detailResponse] = await Promise.all([
    fetch(
      `${API_BASE}/kalshi/fifa/match/${matchId}/history?hours=${hours}`,
      { cache: "no-store" }
    ),
    fetch(`${API_BASE}/kalshi/fifa/match/${matchId}`, {
      cache: "no-store",
    }),
  ]);

  const historyData = await historyResponse.json();
  const detailData = await detailResponse.json();

  return { historyData, detailData };
}
