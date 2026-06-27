import type { Sport } from "./api";

export type SportStatus = "live" | "coming_soon" | "off_season" | "archive";

export interface SportMeta {
  key: Sport;
  name: string;
  shortName: string;
  icon: string;
  status: SportStatus;
  // Short human description of what's happening with this sport
  tagline: string;
  // When the sport returns / ends, for non-live states
  statusDetail?: string;
}

// Frontend mirror of the backend SPORTS_CONFIG. Keep statuses in sync with
// the backend; this drives which cards are clickable on the landing page.
export const SPORTS: SportMeta[] = [
  {
    key: "fifa",
    name: "FIFA World Cup",
    shortName: "FIFA",
    icon: "⚽",
    status: "live",
    tagline: "World Cup 2026 markets, live now.",
    statusDetail: "Through July 19, 2026",
  },
  {
    key: "mlb",
    name: "Major League Baseball",
    shortName: "MLB",
    icon: "⚾",
    status: "live",
    tagline: "Daily moneyline edges across the league.",
    statusDetail: "Regular season",
  },
];

export const STATUS_LABELS: Record<SportStatus, string> = {
  live: "Live",
  coming_soon: "Coming Soon",
  off_season: "Off Season",
  archive: "Archive",
};

// Tailwind class fragments per status (badge styling)
export const STATUS_STYLES: Record<SportStatus, string> = {
  live: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  coming_soon: "border-zinc-400/15 bg-zinc-500/10 text-zinc-300",
  off_season: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  archive: "border-blue-400/20 bg-blue-500/10 text-blue-300",
};

export function getSport(key: Sport): SportMeta | undefined {
  return SPORTS.find((s) => s.key === key);
}

// Returns the SportMeta for a key, or null if it's not a known sport.
// Used by route pages to 404 unknown sports cleanly.
export function isValidSport(key: string): key is Sport {
  return SPORTS.some((s) => s.key === key);
}
