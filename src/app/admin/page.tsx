"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/admin/companies", {
          method: "GET",
          credentials: "include", // ⭐ sends auth cookie
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to fetch companies");
          return;
        }

        const data = await res.json();
        setCompanies(data);
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <pre>{JSON.stringify(companies, null, 2)}</pre>
    </div>
  );
}