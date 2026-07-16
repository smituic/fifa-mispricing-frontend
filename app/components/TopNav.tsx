"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SPORTS, getSport } from "@/lib/sports";
import type { Sport } from "@/lib/api";

export default function TopNav({ sport }: { sport: Sport }) {
  const pathname = usePathname();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const current = getSport(sport);

  const navItems = [
    { href: `/sport/${sport}`, label: "Markets" },
    { href: `/sport/${sport}/opportunities`, label: "Opportunities" },
    { href: `/sport/${sport}/movers`, label: "EV Movers" },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-white/8 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        {/* Logo → home (sports picker) */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-sm font-semibold text-emerald-300">
            KM
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-white">
              Kalshi Mispricing Tracker
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              {current ? `${current.icon} ${current.shortName}` : "Multi-Sport"}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Sport switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen((v) => !v)}
              onBlur={() => setTimeout(() => setSwitcherOpen(false), 150)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
            >
              <span>
                {current ? `${current.icon} ${current.shortName}` : "Sport"}
              </span>
              <span className="text-xs text-zinc-500">▼</span>
            </button>

            {switcherOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/8 bg-zinc-950/95 p-1 shadow-2xl backdrop-blur">
                {SPORTS.map((s) => {
                  const isCurrent = s.key === sport;
                  const isOpenable =
                    s.status === "live" || s.status === "archive";
                  return (
                    <Link
                      key={s.key}
                      href={isOpenable ? `/sport/${s.key}` : "#"}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                        isCurrent
                          ? "bg-white/8 text-white"
                          : isOpenable
                            ? "text-zinc-300 hover:bg-white/6 hover:text-white"
                            : "cursor-not-allowed text-zinc-600"
                      }`}
                      onClick={(e) => {
                        if (!isOpenable) e.preventDefault();
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span>{s.shortName}</span>
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300">
                          Current
                        </span>
                      ) : s.status === "archive" ? (
                        <span className="text-[10px] uppercase tracking-wider text-blue-300">
                          Archive
                        </span>
                      ) : !isOpenable ? (
                        <span className="text-[10px] uppercase tracking-wider text-zinc-600">
                          Soon
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Page nav */}
          <nav className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 p-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-400 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
