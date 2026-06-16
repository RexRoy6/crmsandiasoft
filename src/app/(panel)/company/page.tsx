"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardCard from "@/app/components/DashboardCard";
import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";

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
      <PageHeader title="Dashboard" />

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && (
        <p style={{ color: "var(--text-secondary)" }}>Loading dashboard...</p>
      )}

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

          {/* ---------- COMPANY INFO ---------- */}

          {user && (
            <div
              style={{
                background: "var(--bg-primary)",
                padding: 24,
                borderRadius: 12,
                border: "1px solid var(--border-color)",
                maxWidth: 500,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  marginBottom: 10,
                }}
              >
                Company Info
              </h2>

              <div>
                <strong>Email:</strong> {user.email}
              </div>

              <div>
                <strong>Role:</strong> {user.role}
              </div>

              <div>
                <strong>Company:</strong> {user.companyName}
              </div>

              <div>
                <strong>Company ID:</strong> {user.companyId}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
