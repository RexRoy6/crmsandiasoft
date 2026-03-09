"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Tipos de datos
interface Company {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface User {
  id: number;
  company_id: number;
  name: string;
  email: string;
  role: string;
  deletedAt: Date | null;
}

// interface FinancialSummary {
//   totalLifetimeRevenue: number;
//   revenueGrowth: number; // porcentaje
//   activeEvents: number;
//   contracts: number;
//   totalBilled: number;
//   collectionRate: number; // porcentaje
// }

// interface AuditEntry {
//   id: string;
//   description: string;
//   timestamp: string; // ISO
//   user?: string;
// }

const AdminCompanyPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  // Estados
  const [company, setCompany] = useState<Company | null>(null);
  const [Users, setUsers] = useState<User[]>([]);
  // const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  // const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"team" | "events" | "services">(
    "team",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suspendConfirm, setSuspendConfirm] = useState(false);

  // Fetch todos los datos de la compañía
  useEffect(() => {
    if (!companyId) return;

    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [companyRes, UsersRes] = await Promise.all([
          fetch(`/api/admin/companies/${companyId}`),
          fetch(`/api/admin/companies/${companyId}/users`),
          // fetch(`/api/admin/companies/${companyId}/financial`),
          // fetch(`/api/admin/companies/${companyId}/audit`),
        ]);

        // Verificar respuestas
        if (!companyRes.ok) throw new Error("Error al cargar la empresa");
        if (!UsersRes.ok) throw new Error("Error al cargar miembros");
        // if (!financialRes.ok) throw new Error("Error al cargar finanzas");
        // if (!auditRes.ok) throw new Error("Error al cargar auditoría");

        const companyData = await companyRes.json();
        const UsersData = await UsersRes.json();
        // const financialData = await financialRes.json();
        // const auditData = await auditRes.json();

        setCompany(companyData);
        setUsers(UsersData);
        // setFinancial(financialData);
        // setAuditLogs(auditData);
      } catch (err: any) {
        setError(err.message || "Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  // Acciones
  const handleEdit = () => {
    router.push(`/admin/companies/${companyId}/edit`);
  };

  const handleSuspend = async () => {
    if (!suspendConfirm) {
      setSuspendConfirm(true);
      return;
    }
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al suspender");
      // Actualizar estado local
      setCompany((prev) => (prev ? { ...prev, status: "suspended" } : null));
      setSuspendConfirm(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // const handleDownloadReport = () => {
  //   // Simular descarga de reporte
  //   window.open(`/api/admin/companies/${companyId}/report`, "_blank");
  // };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Cargando información de la empresa...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div style={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error || "No se pudo cargar la empresa"}</p>
        <button onClick={() => router.back()} style={styles.primaryButton}>
          Volver
        </button>
      </div>
    );
  }

  // Separar miembros por rol
  const owners = Users.filter((m) => m.role === "owner");
  const managersStaff = Users.filter(
    (m) => m.role === "manager" || m.role === "staff",
  );

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.headerTitle}>Admin Console</h2>
          <span style={styles.headerSubtitle}>Company Management</span>
        </div>

        <div style={styles.userBox}>
          <div style={styles.avatar}>SA</div>
          <div>
            <div style={styles.userName}>System Admin</div>
            <div style={styles.userRole}>Super User</div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div style={styles.container}>
        {/* LEFT COLUMN */}
        <div style={styles.leftColumn}>
          {/* COMPANY CARD */}
          <div style={styles.companyCard}>
            <div style={styles.companyInfo}>
              <div style={styles.companyLogo}>
                {company.logo ? (
                  <Image
                    src={company.logo}
                    alt="Company Logo"
                    width={60}
                    height={60}
                    style={{ borderRadius: 12 }}
                  />
                ) : (
                  <div style={styles.placeholderLogo}>
                    {company.name.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h3 style={styles.companyName}>
                  {company.name}{" "}
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(company.status === "active"
                        ? styles.activeBadge
                        : company.status === "suspended"
                          ? styles.suspendedBadge
                          : styles.inactiveBadge),
                    }}
                  >
                    {/* {company.status.toUpperCase()} */}
                  </span>
                </h3>
                <p style={styles.companyMeta}>
                  {company.email} · {company.phone}
                </p>
                <p style={styles.companyMeta}>{company.address}</p>
              </div>
            </div>

            <div style={styles.actions}>
              <button onClick={handleEdit} style={styles.editBtn}>
                Edit
              </button>
              {suspendConfirm ? (
                <div style={styles.confirmBox}>
                  <span>¿Seguro?</span>
                  <button onClick={handleSuspend} style={styles.confirmYes}>
                    Sí
                  </button>
                  <button
                    onClick={() => setSuspendConfirm(false)}
                    style={styles.confirmNo}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSuspend}
                  style={styles.suspendBtn}
                  disabled={company.status === "suspended"}
                >
                  {company.status === "suspended" ? "Suspended" : "Suspend"}
                </button>
              )}
            </div>
          </div>

          {/* TABS & CONTENT */}
          <div style={styles.card}>
            <div style={styles.tabs}>
              <span
                style={activeTab === "team" ? styles.activeTab : styles.tab}
                onClick={() => setActiveTab("team")}
              >
                Team Users
              </span>
              <span
                style={activeTab === "events" ? styles.activeTab : styles.tab}
                onClick={() => setActiveTab("events")}
              >
                Events
              </span>
              <span
                style={activeTab === "services" ? styles.activeTab : styles.tab}
                onClick={() => setActiveTab("services")}
              >
                Services Catalog
              </span>
            </div>

            {activeTab === "team" && (
              <>
                <h4 style={styles.sectionTitle}>OWNERS ({owners.length})</h4>
                {owners.length > 0 ? (
                  <div style={styles.UserGrid}>
                    {owners.map((m) => (
                      <UserCard
                        key={m.id}
                        initials={m.initials}
                        name={m.name}
                        email={m.email}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={styles.emptyText}>No owners assigned</p>
                )}

                <h4 style={styles.sectionTitle}>
                  MANAGERS & STAFF ({managersStaff.length})
                </h4>
                {managersStaff.length > 0 ? (
                  <div style={styles.UserGrid}>
                    {managersStaff.map((m) => (
                      <UserCard
                        key={m.id}
                        initials={m.initials}
                        name={m.name}
                        email={m.email}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={styles.emptyText}>No managers or staff</p>
                )}
              </>
            )}

            {activeTab === "events" && (
              <div style={styles.tabContent}>
                <p>Lista de eventos próximamente...</p>
              </div>
            )}

            {activeTab === "services" && (
              <div style={styles.tabContent}>
                <p>Catálogo de servicios próximamente...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- COMPONENTE User CARD ---------- */
const UserCard = ({
  initials,
  name,
  email,
}: {
  initials: string;
  name: string;
  email: string;
}) => (
  <div style={styles.UserCard}>
    <div style={styles.UserAvatar}>{initials}</div>
    <div>
      <div style={styles.UserName}>{name}</div>
      <div style={styles.UserEmail}>{email}</div>
    </div>
  </div>
);

export default AdminCompanyPage;

/* ---------- ESTILOS (adaptados para funcionalidad) ---------- */
const styles: Record<string, React.CSSProperties> = {
  // ... (mantén los estilos originales y añade los nuevos)
  page: {
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
  },
  header: {
    padding: "20px 40px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { margin: 0 },
  headerSubtitle: { fontSize: 12, color: "#6b7280" },
  userBox: { display: "flex", gap: 10, alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  userName: { fontWeight: 600 },
  userRole: { fontSize: 12, color: "#6b7280" },
  container: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 20,
    padding: 40,
  },
  leftColumn: { display: "flex", flexDirection: "column", gap: 20 },
  rightColumn: { display: "flex", flexDirection: "column", gap: 20 },
  companyCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  companyInfo: { display: "flex", gap: 20, alignItems: "center" },
  companyLogo: { backgroundColor: "#eef2ff", padding: 10, borderRadius: 12 },
  placeholderLogo: {
    width: 60,
    height: 60,
    backgroundColor: "#6366f1",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 600,
    borderRadius: 12,
  },
  companyName: { margin: 0, display: "flex", alignItems: "center", gap: 10 },
  statusBadge: {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
  },
  activeBadge: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  suspendedBadge: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
  inactiveBadge: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
  },
  companyMeta: { margin: 0, fontSize: 13, color: "#6b7280" },
  actions: { display: "flex", gap: 10, alignItems: "center" },
  editBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  suspendBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #fecaca",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
  },
  confirmBox: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    backgroundColor: "#fff3f3",
    padding: "4px 8px",
    borderRadius: 6,
  },
  confirmYes: {
    background: "#b91c1c",
    color: "#fff",
    border: "none",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
  },
  confirmNo: {
    background: "#e5e7eb",
    border: "none",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  tabs: { display: "flex", gap: 20, marginBottom: 20, cursor: "pointer" },
  activeTab: {
    fontWeight: 600,
    color: "#4f46e5",
    borderBottom: "2px solid #4f46e5",
    paddingBottom: 4,
  },
  tab: { color: "#6b7280", paddingBottom: 4 },
  sectionTitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 16,
    marginBottom: 8,
  },
  UserGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  UserCard: {
    border: "1px solid #e5e7eb",
    padding: 14,
    borderRadius: 10,
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  UserAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  UserName: { fontWeight: 500 },
  UserEmail: { fontSize: 12, color: "#6b7280" },
  emptyText: { color: "#9ca3af", fontSize: 14, fontStyle: "italic" },
  tabContent: { padding: "20px 0", textAlign: "center", color: "#6b7280" },
  summaryTitle: { fontSize: 13, color: "#9ca3af", marginBottom: 10 },
  revenue: { marginBottom: 20 },
  revenueLabel: { fontSize: 14, color: "#4b5563" },
  revenueAmount: { fontSize: 22, fontWeight: 700, margin: "4px 0" },
  revenueGrowth: { fontSize: 12 },
  statsRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statValue: { fontSize: 18, fontWeight: 600 },
  statLabel: { fontSize: 12, color: "#6b7280" },
  primaryButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 8,
  },
  auditList: { listStyle: "none", padding: 0, margin: 0 },
  auditItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 14,
  },
  auditTime: { color: "#9ca3af", fontSize: 12 },
  viewAllLink: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    cursor: "pointer",
    fontSize: 14,
    marginTop: 12,
    textAlign: "left",
    padding: 0,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  loadingSpinner: {
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    width: 40,
    height: 40,
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    padding: 40,
    textAlign: "center",
  },
};
