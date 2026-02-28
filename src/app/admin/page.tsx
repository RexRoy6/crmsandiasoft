"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [creating, setCreating] = useState(false);

  /* ---------- GET CURRENT USER (runs on page load) ---------- */
  const fetchMe = async () => {
    try {
      const res = await fetch("/api/admin/me", {
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      // if (!res.ok) {
      //   console.error("Failed to load user:", data.error);
      //   return;
      // }
      if (res.status === 401) {
        window.location.href = "/login"
      }

      setUser(data);
    } catch (err) {
      console.error("User fetch error", err);
    }
  };

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
        body: JSON.stringify({ name: newCompanyName }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to create company");
        return;
      }

      setNewCompanyName("");
      await fetchCompanies();
    } catch {
      setError("Connection error");
    } finally {
      setCreating(false);
    }
  };

  /* ---------- RUN ON PAGE LOAD ---------- */
  useEffect(() => {
    fetchMe(); // load user automatically
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* ---------- USER INFO ---------- */}
      <div style={{ marginBottom: 20 }}>
        <h2>Current User</h2>
        {user ? (
          <pre>{JSON.stringify(user, null, 2)}</pre>
        ) : (
          <div>Loading user...</div>
        )}
      </div>

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