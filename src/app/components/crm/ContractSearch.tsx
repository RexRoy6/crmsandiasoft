"use client";

import { useEffect, useState } from "react";

export default function ContractSearch({ onSelect }: any) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!search) {
        setResults([]);
        return;
      }

      const res = await fetch(
        `/api/company/contracts?search=${search}&limit=5`,
        { credentials: "include" }
      );

      if (!res.ok) return;

      const data = await res.json();

      // 👇 solo contratos con saldo pendiente
      const filtered = data.data.filter(
        (c: any) => c.remainingAmount > 0
      );

      setResults(filtered);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <input
        placeholder="Search contract..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
        }}
      />

      {results.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelect(c)}
          style={{
            padding: 10,
            borderRadius: 8,
            cursor: "pointer",
            background: "var(--bg-secondary)",
          }}
        >
          <strong>
            #{c.id} · {c.client?.name}
          </strong>

          <div style={{ fontSize: 12 }}>
            {c.event?.name}
          </div>

          <div style={{ fontSize: 12 }}>
            💰 Remaining: ${c.remainingAmount}
          </div>
        </div>
      ))}
    </div>
  );
}