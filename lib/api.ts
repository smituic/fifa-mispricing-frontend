const API_BASE = "http://localhost:8000";

export async function fetchMatches() {
  const res = await fetch(`${API_BASE}/kalshi/fifa/matches`);

  if (!res.ok) {
    throw new Error("Failed to fetch matches");
  }

  const data = await res.json();
  return data.matches;
}

export async function fetchMatchHistory(matchId: string, hours: number) {
  const res = await fetch(
    `${API_BASE}/kalshi/fifa/match/${matchId}/history?hours=${hours}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch match history");
  }

  const data = await res.json();
  return data.matches;
}