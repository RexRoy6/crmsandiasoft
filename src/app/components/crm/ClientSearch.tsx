"use client";

import { useEffect, useState } from "react";

export default function ClientSearch({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (client: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search) {
        setResults([]);
        return;
      }

      fetchClients();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const fetchClients = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/company/clients?search=${search}`,
        { credentials: "include" }
      );

      const data = await res.json();

      setResults(data.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      {/* input */}
      {!selected && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client..."
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
          }}
        />
      )}

      {/* loading */}
      {loading && <p style={{ fontSize: 12 }}>Searching...</p>}

      {/* results */}
      {!selected && results.length > 0 && (
        <div
          style={{
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            marginTop: 6,
            maxHeight: 200,
            overflowY: "auto",
            background: "white",
          }}
        >
          {results.map((client) => (
            <div
              key={client.id}
              onClick={() => {
                onSelect(client);
                setResults([]); // 🔥 limpia resultados
                setSearch("");  // 🔥 limpia input
              }}
              style={{
                padding: 10,
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ fontWeight: 500 }}>{client.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {client.phone}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}