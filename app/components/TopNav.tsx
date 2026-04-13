"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/fifa", label: "Markets" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/movers", label: "EV Movers" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 border-b border-white/8 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-sm font-semibold text-emerald-300">
            KM
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-white">
              Kalshi Mispricing Tracker
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              FIFA 2026
            </div>
          </div>
        </Link>

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
  );
}