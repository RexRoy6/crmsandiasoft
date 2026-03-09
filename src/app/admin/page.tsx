"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

const AdminDashboard: React.FC = () => {
  const router = useRouter();

  // Estados
  const [companies, setCompanies] = useState<Company[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* ---------- Obtener usuario actual ---------- */
  const fetchMe = async () => {
    try {
      const res = await fetch("/api/admin/me", {
        credentials: "include",
      });

      if (res.status === 401) {
        router.replace("/");
        return;
      }

      const data = await res.json().catch(() => ({}));
      setUser(data);
    } catch (err) {
      console.error("Error al obtener usuario", err);
      setError("Error de conexión al obtener usuario");
    }
  };

  /* ---------- Obtener lista de empresas ---------- */
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
        setError(data.error || "Error al cargar empresas");
        return;
      }

      setCompanies(data);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Crear nueva empresa ---------- */
  const createCompany = async () => {
    if (!newCompanyName.trim()) {
      setError("El nombre de la empresa es obligatorio");
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
        setError(data.error || "Error al crear empresa");
        return;
      }

      setNewCompanyName("");
      setShowCreateModal(false);
      await fetchCompanies(); // Recargar lista
    } catch {
      setError("Error de conexión");
    } finally {
      setCreating(false);
    }
  };

  /* ---------- Cerrar sesión ---------- */
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Error al cerrar sesión");
        return;
      }

      setUser(null);
      setCompanies([]);
      router.replace("/");
    } catch {
      setError("Error de conexión");
    }
  };

  /* ---------- Cargar datos al montar el componente ---------- */
  useEffect(() => {
    fetchMe();
    fetchCompanies();
  }, []);

  const hoy = new Date();
  const hace7Dias = new Date(hoy);
  hace7Dias.setDate(hoy.getDate() - 7);
  // Calcular métricas basadas en empresas reales
  const inicioHace7Dias = new Date(hoy);
  inicioHace7Dias.setDate(hoy.getDate() - 7);
  inicioHace7Dias.setHours(0, 0, 0, 0);

  const metrics = {
    total: companies.length,
    active: companies.filter((c) => c.deletedAt == null).length,
    newSignups: companies.filter((c) => {
      const fechaCreacion = new Date(c.createdAt); // convertir string a Date
      return fechaCreacion >= inicioHace7Dias;
    }).length,
  };

  // Filtrar empresas por nombre
  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  /* ---------- Renderizar badge según estado ---------- */
  const getStatusBadge = (deletedAt: Company["deletedAt"]) => {
    let statusKey: "active" | "inactive" | "issue";
    if (deletedAt == null) {
      statusKey = "active";
    } else {
      statusKey = "inactive";
    }
    const statusConfig = {
      active: { color: "#065f46", bg: "#d1fae5", icon: "●", label: "Activa" },
      inactive: {
        color: "#374151",
        bg: "#e5e7eb",
        icon: "○",
        label: "Inactiva",
      },
      issue: {
        color: "#991b1b",
        bg: "#fee2e2",
        icon: "⚠",
        label: "Incidencia",
      },
    };
    const config = statusConfig[statusKey];
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: "500",
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
      {/* Header fijo */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBox}>
            <Image
              src="/sandiasoft.png"
              alt="CRM Logo"
              style={{ borderRadius: 8 }}
              width={28}
              height={28}
            />
          </div>
          <span style={styles.logoText}>Sandiasoft</span>
        </div>

        <input
          placeholder="Buscar empresas..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={styles.headerRight}>
          <Image
            src="/notifications.svg"
            alt="notification"
            width={25}
            height={25}
            style={styles.notificationIcon}
          />
          <button style={styles.logout} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div style={styles.body}>
        {/* Sidebar fijo */}
        <aside style={styles.sidebar}>
          <div>
            <p style={styles.sidebarTitle}>MENU</p>
            <button style={styles.sidebarActive}>Inicio</button>
            <button style={styles.sidebarItem}>Empresas</button>
            <button style={styles.sidebarItem}>Usuarios</button>
            <button style={styles.sidebarItem}>Contratos</button>
            <button style={styles.sidebarItem}>Finansas</button>
          </div>
          <div>
            <p style={styles.sidebarTitle}>SOPORTE</p>
            <button style={styles.sidebarItem}>Configuraciones</button>
            <button style={styles.sidebarItem}>Centro de ayuda</button>
          </div>

          {user && (
            <div style={styles.userBox}>
              <strong>{user.name}</strong>
              <br />
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {user.email}
              </span>
            </div>
          )}
        </aside>

        {/* Contenido principal */}
        <main style={styles.main}>
          {/* Cabecera del main con título y botón de añadir */}
          <div style={styles.mainHeader}>
            <div>
              <h2 style={{ margin: 0 }}>Resumen del portafolio</h2>
              <p style={styles.subtitle}>
                Gestión del rendimiento de todas las entidades registradas.
              </p>
            </div>
            <button
              style={styles.primaryButton}
              onClick={() => setShowCreateModal(true)}
            >
              + Añadir empresa
            </button>
          </div>

          {/* Tarjetas de métricas */}
          {!loading && companies.length > 0 && (
            <div style={styles.metricsRow}>
              <MetricCard
                title="Empresas totales"
                value={metrics.total.toString()}
              />
              <MetricCard
                title="Empresas activas"
                value={metrics.active.toString()}
              />
              <MetricCard
                title="Nuevos registros (últimos 7d)"
                value={metrics.newSignups.toString()}
              />
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div style={styles.errorBanner}>
              <span>❌ {error}</span>
              <button onClick={() => setError("")} style={styles.errorClose}>
                ×
              </button>
            </div>
          )}

          {/* Tabla de empresas */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={{ margin: 0 }}>Directorio de empresas</h3>
              {filteredCompanies.length > 0 && (
                <span style={styles.tableCount}>
                  {filteredCompanies.length} empresas
                </span>
              )}
            </div>

            {loading ? (
              <div style={styles.loading}>Cargando empresas...</div>
            ) : filteredCompanies.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Empresa</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((c) => (
                    <tr key={c.id} style={styles.tr}>
                      <td style={styles.td}>{c.name}</td>
                      <td style={styles.td}>{getStatusBadge(c.status)}</td>
                      <td style={styles.td}>
                        <Link href={`/admin/companie/${c.id}/`} passHref>
                          <button style={styles.manageButton}>
                            Gestionar →
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={styles.noResults}>
                <p>No hay empresas que coincidan con tu búsqueda.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal para crear empresa */}
      {showCreateModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowCreateModal(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Nueva empresa</h3>
            <input
              type="text"
              placeholder="Nombre de la empresa"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              style={styles.modalInput}
              autoFocus
            />
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={styles.modalCancel}
              >
                Cancelar
              </button>
              <button
                onClick={createCompany}
                disabled={creating}
                style={{
                  ...styles.modalCreate,
                  ...(creating ? { opacity: 0.6, cursor: "not-allowed" } : {}),
                }}
              >
                {creating ? "Creando..." : "Crear empresa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Componente auxiliar para tarjetas de métricas */
const MetricCard: React.FC<{ title: string; value: string }> = ({
  title,
  value,
}) => (
  <div style={styles.metricCard}>
    <p style={styles.metricTitle}>{title}</p>
    <h3 style={{ margin: 0, fontSize: 28 }}>{value}</h3>
  </div>
);

export default AdminDashboard;

/* ---------- Estilos (igual que el primer bloque, con algunas adiciones) ---------- */
const HEADER_HEIGHT = 58;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    position: "relative",
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
    position: "fixed",
    height: HEADER_HEIGHT,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
    width: 480,
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
    width: 200,
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    padding: "24px 16px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    top: HEADER_HEIGHT,
    left: 0,
    overflow: "hidden",
    zIndex: 999,
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
    marginTop: HEADER_HEIGHT,
    marginLeft: 200,
    minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
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
  errorBanner: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 20px",
    borderRadius: 8,
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #fecaca",
  },
  errorClose: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#b91c1c",
    padding: "0 8px",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: 12,
    width: "400px",
    maxWidth: "90%",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  },
  modalInput: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    marginBottom: 20,
    outline: "none",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancel: {
    padding: "8px 16px",
    background: "none",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  modalCreate: {
    padding: "8px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
};
