import Link from "next/link";

const features = [
  {
    title: "Live market monitoring",
    text: "Track current FIFA markets, implied probabilities, and edge signals in one place.",
  },
  {
    title: "Opportunity ranking",
    text: "Surface the strongest current edges by outcome, not just by match.",
  },
  {
    title: "EV movement analysis",
    text: "See which outcomes are moving fastest across your selected time window.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 md:px-8">
      <div className="max-w-4xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
          Prediction Market Intelligence
        </div>

        <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
          A cleaner way to spot FIFA market mispricings.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          A dark, decision-first dashboard for monitoring Kalshi FIFA markets,
          ranking live opportunities, and tracking how expected value moves over time.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/fifa"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:scale-[1.02]"
          >
            Open Platform →
          </Link>

          <Link
            href="/opportunities"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
          >
            View Opportunities
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur"
          >
            <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{feature.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}