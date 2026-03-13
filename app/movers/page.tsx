"use client";

import { useEffect, useState } from "react";
import { fetchEvMovers } from "../../lib/api";

export default function EvMovers() {

  const [movers, setMovers] = useState<any[]>([]);

  useEffect(() => {
    fetchEvMovers().then(setMovers);
  }, []);

  return (
    <main className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        EV Movers (Last 6h)
      </h1>

      <div className="space-y-4">

        {movers.map((m: any, i) => (
          <div
            key={i}
            className="border p-4 rounded flex justify-between"
          >
            <div>{m.team}</div>

            <div
              className={`font-bold ${
                m.ev_change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {(m.ev_change * 100).toFixed(2)}%
            </div>

          </div>
        ))}

      </div>

    </main>
  );
}