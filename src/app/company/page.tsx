"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompanyDashboard() {
  const [user, setUser] = useState<any>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  /* ---------- GET CURRENT USER ---------- */

  const fetchMe = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/company/me", {
        credentials: "include",
      });

      if (res.status === 401) {
        router.replace("/");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to load user");
        return;
      }

      setUser(data);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- LOGOUT ---------- */

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to logout");
        return;
      }

      setUser(null);

      router.replace("/");
    } catch {
      setError("Connection error");
    }
  };

  /* ---------- RUN ON PAGE LOAD ---------- */

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Company Dashboard</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={logout}>Logout</button>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* ---------- USER INFO ---------- */}

      <div style={{ marginBottom: 20 }}>
        <h2>Current User</h2>

        {loading && <div>Loading...</div>}

        {!loading && user && (
          <div>
            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>Role:</strong> {user.role}
            </p>

            <p>
              <strong>Company ID:</strong> {user.companyId}
            </p>

            <p>
              <strong>Company Name:</strong> {user.companyName}
            </p>
          </div>
        )}
      </div>

      {/* ---------- RAW JSON (debug) ---------- */}

      <div>
        <h2>User JSON</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}