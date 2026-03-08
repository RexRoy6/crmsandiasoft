"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardCard from "@/app/components/DashboardCard";
import ErrorBox from "@/app/components/ErrorBox";

export default function CompanyDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const meRes = await fetch("/api/company/me", {
        credentials: "include",
      });

      if (meRes.status === 401) {
        router.replace("/");
        return;
      }

      if (!meRes.ok) {
        setError("Failed to fetch user");
        setErrorCode(meRes.status);
        return;
      }

      const meData = await meRes.json();
      setUser(meData);

      const dashRes = await fetch("/api/company/dashboard", {
        credentials: "include",
      });

      if (!dashRes.ok) {
        setError("Failed to fetch dashboard");
        setErrorCode(dashRes.status);
        return;
      }

      const dashData = await dashRes.json();
      setStats(dashData);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Company Dashboard</h1>

      

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && <p>Loading...</p>}

      {!loading && stats && (
        <>
          {/* ---------- METRICS ---------- */}

          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 40,
            }}
          >
            <DashboardCard title="Clients" value={stats.clients} />

            <DashboardCard title="Events" value={stats.events} />

            <DashboardCard
              title="Active Contracts"
              value={stats.contractsActive}
            />

            <DashboardCard
              title="Revenue This Month"
              value={`$${stats.revenueThisMonth}`}
            />

            <DashboardCard
              title="Pending Payments"
              value={`$${stats.pendingPayments}`}
            />
          </div>

          {/* ---------- USER INFO ---------- */}

          {user && (
            <div
              style={{
                background: "white",
                padding: 20,
                borderRadius: 10,
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              <h2>Company Info</h2>

              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <p>
                <strong>Role:</strong> {user.role}
              </p>

              <p>
                <strong>Company:</strong> {user.companyName}
              </p>

              <p>
                <strong>Company ID:</strong> {user.companyId}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}