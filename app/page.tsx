import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-10">

      {/* Centered title */}
      <h1 className="text-4xl font-bold text-center mb-16">
        Kalshi Mispricing Tracker
      </h1>

      {/* Left aligned market box */}
      <div className="flex justify-start">
        <Link
          href="/fifa"
          className="w-72 border rounded-xl p-6 hover:bg-gray-100 transition shadow-sm"
        >
          <h2 className="text-xl font-semibold">
            FIFA Markets
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Detect mispriced FIFA betting markets
          </p>
        </Link>
      </div>

    </main>
  );
}