"use client";

import { useEffect, useState } from "react";

export default function EventSearch({ onSelect }: any) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!search) {
        setResults([]);
        return;
      }

      const res = await fetch(
        `/api/company/events?search=${search}&limit=5`,
        { credentials: "include" }
      );

      if (!res.ok) return;

      const data = await res.json();
      setResults(data.data);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div style={{ marginTop: 6 }}>
      <input
        placeholder="Search event..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: 6,
          border: "1px solid var(--border-color)",
        }}
      />

      {results.length > 0 && (
        <div
          style={{
            marginTop: 6,
            border: "1px solid var(--border-color)",
            borderRadius: 6,
            background: "var(--bg-primary)",
          }}
        >
          {results.map((event) => (
            <div
              key={event.id}
              onClick={() => {
                onSelect(event);
                setSearch("");
                setResults([]);
              }}
              style={{
                padding: 8,
                cursor: "pointer",
              }}
            >
              {event.name} ({event.client?.name})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}