"use client";

import { useState } from "react";

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [creating, setCreating] = useState(false);

  /* ---------- GET companies ---------- */
  const fetchCompanies = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/companies", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to fetch companies");
        return;
      }

      setCompanies(data);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- POST create company ---------- */
  const createCompany = async () => {
    if (!newCompanyName.trim()) {
      setError("Company name required");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCompanyName,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to create company");
        return;
      }

      setNewCompanyName("");
      await fetchCompanies(); // refresh list
    } catch {
      setError("Connection error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* ---------- CREATE COMPANY ---------- */}
      <div style={{ marginBottom: 20 }}>
        <h2>Create Company</h2>

        <input
          placeholder="Company name"
          value={newCompanyName}
          onChange={(e) => setNewCompanyName(e.target.value)}
        />

        <button onClick={createCompany} disabled={creating}>
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      {/* ---------- FETCH COMPANIES ---------- */}
      <div style={{ marginBottom: 20 }}>
        <h2>Companies</h2>

        <button onClick={fetchCompanies} disabled={loading}>
          {loading ? "Loading..." : "Load Companies"}
        </button>
      </div>

      <pre>{JSON.stringify(companies, null, 2)}</pre>
    </div>
  );
}