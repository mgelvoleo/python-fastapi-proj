"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/services/api";

export default function Home() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    getHealth().then(setHealth);
  }, []);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>FastAPI + Next.js</h1>

      {health ? (
        <pre>{JSON.stringify(health, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}
