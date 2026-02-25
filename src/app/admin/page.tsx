"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AdminDashboardClient: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Datos de ejemplo
  const user = {
    name: "Erick Galván",
    email: "erick.admin@myplatform.com",
  };

  const companies = [
    { id: 1, name: "NovaTech Solutions", status: "active" },
    { id: 2, name: "GreenCore Industries", status: "active" },
    { id: 3, name: "UrbanEdge Logistics", status: "inactive" },
    { id: 4, name: "Quantum Financial Group", status: "issue" },
    { id: 5, name: "SkyBridge Systems", status: "active" },
    { id: 6, name: "Vertex Medical", status: "issue" },
  ];

  const metrics = {
    total: companies.length,
    active: companies.filter((c) => c.status === "active").length,
    issues: companies.filter((c) => c.status === "issue").length,
    newSignups: 3,
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleLogout = async () => {
    console.log("Logout simulated");
    router.push("/");
  };

  // Función para obtener el badge según el estado
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; bg: string; icon: string; label: string }
    > = {
      active: { color: "#065f46", bg: "#d1fae5", icon: "●", label: "Active" },
      inactive: {
        color: "#374151",
        bg: "#e5e7eb",
        icon: "○",
        label: "Inactive",
      },
      issue: { color: "#991b1b", bg: "#fee2e2", icon: "⚠", label: "Issue" },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span
        style={{
          ...styles.badge,
          backgroundColor: config.bg,
          color: config.color,
        }}
      >
        <span style={{ marginRight: 4 }}>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBox}>C</div>
          <span style={styles.logoText}>Multi-Company Admin</span>
        </div>

        <input
          placeholder="Search companies..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={styles.headerRight}>
          <span style={styles.notificationIcon}>🔔</span>
          <button style={styles.logout} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      <div style={styles.body}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div>
            <p style={styles.sidebarTitle}>PORTFOLIO</p>
            <button style={styles.sidebarActive}>Dashboard</button>
            <button style={styles.sidebarItem}>Company Directory</button>
            <button style={styles.sidebarItem}>Subscriptions</button>
            <button style={styles.sidebarItem}>Portfolio Analytics</button>
          </div>

          <div style={styles.userBox}>
            <strong>{user.name}</strong>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{user.email}</span>
          </div>
        </aside>

        {/* Main Content */}
        <main style={styles.main}>
          <div style={styles.mainHeader}>
            <div>
              <h2 style={{ margin: 0 }}>Portfolio Summary</h2>
              <p style={styles.subtitle}>
                Managing performance across all registered entities.
              </p>
            </div>
            <button style={styles.primaryButton}>+ Add Company</button>
          </div>

          {/* Metrics Cards */}
          <div style={styles.metricsRow}>
            <MetricCard
              title="Total Managed Companies"
              value={metrics.total.toString()}
            />
            <MetricCard
              title="Active Subscriptions"
              value={metrics.active.toString()}
            />
            <MetricCard
              title="Companies with Issues"
              value={metrics.issues.toString()}
            />
            <MetricCard
              title="New Signups (7d)"
              value={metrics.newSignups.toString()}
            />
          </div>

          {/* Improved Table */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={{ margin: 0 }}>Company Directory</h3>
              {filteredCompanies.length > 0 && (
                <span style={styles.tableCount}>
                  {filteredCompanies.length} companies
                </span>
              )}
            </div>

            {filteredCompanies.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Company</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((c) => (
                    <tr key={c.id} style={styles.tr}>
                      <td style={styles.td}>{c.name}</td>
                      <td style={styles.td}>{getStatusBadge(c.status)}</td>
                      <td style={styles.td}>
                        <Link href={`/admin/companies/${c.id}`} passHref>
                          <button style={styles.manageButton}>Manage →</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={styles.noResults}>
                <p>No companies match your search.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string }> = ({
  title,
  value,
}) => (
  <div style={styles.metricCard}>
    <p style={styles.metricTitle}>{title}</p>
    <h3 style={{ margin: 0, fontSize: 28 }}>{value}</h3>
  </div>
);

export default AdminDashboardClient;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: {
    padding: "16px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  logoContainer: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  logoText: {
    fontWeight: 600,
    fontSize: 16,
  },
  searchInput: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    width: 280,
    fontSize: 14,
    outline: "none",
    transition: "border 0.2s",
  },
  headerRight: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },
  notificationIcon: {
    fontSize: 20,
    cursor: "pointer",
  },
  logout: {
    padding: "6px 14px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
  },
  body: {
    display: "flex",
  },
  sidebar: {
    width: 260,
    padding: "24px 16px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#9ca3af",
    marginBottom: 12,
    letterSpacing: "0.5px",
  },
  sidebarItem: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: 6,
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  sidebarActive: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    textAlign: "left",
    fontWeight: 500,
    fontSize: 14,
    marginBottom: 4,
  },
  userBox: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: 16,
    marginTop: 16,
  },
  main: {
    flex: 1,
    padding: "32px 40px",
  },
  mainHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  primaryButton: {
    padding: "10px 18px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 14,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  metricsRow: {
    display: "flex",
    gap: 20,
    marginBottom: 32,
  },
  metricCard: {
    backgroundColor: "#ffffff",
    padding: "20px 24px",
    borderRadius: 12,
    flex: 1,
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    border: "1px solid #f0f2f5",
  },
  metricTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: "24px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.02)",
    border: "1px solid #f0f2f5",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tableCount: {
    fontSize: 14,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    padding: "4px 10px",
    borderRadius: 20,
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 8px",
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
  },
  tr: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    transition: "background 0.2s, box-shadow 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  td: {
    padding: "16px",
    fontSize: 14,
    borderBottom: "1px solid #f3f4f6",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 500,
  },
  manageButton: {
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #2563eb",
    background: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.2s",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },
};
