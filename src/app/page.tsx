"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const AdminLogin: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // remember puede enviarse si el API lo soporta
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Credenciales inválidas");
        return;
      }

      // La cookie de sesión se establece en el servidor
      router.push("/admin");
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
    }
  };

  return (
    <div style={styles.page}>
      {/* Barra superior */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBox}>C</div>
          <span style={styles.logoText}>CRM Admin Portal</span>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.linkButton}>Public Site</button>
          <button style={styles.helpButton}>Help</button>
        </div>
      </header>

      {/* Tarjeta de login */}
      <div style={styles.card}>
        <div style={styles.lockIcon}>🔒</div>
        <h2 style={styles.title}>Admin Access</h2>
        <p style={styles.subtitle}>
          Sign in to manage your customer relationships
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <label style={styles.label}>Admin Email</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          {/* Password + olvido */}
          <div style={styles.passwordRow}>
            <label style={styles.label}>Password</label>
            <button
              type="button"
              style={styles.forgotPassword}
              onClick={() => alert("Funcionalidad no implementada")}
            >
              Forgot password?
            </button>
          </div>

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {/* Checkbox "Remember me" */}
          <div style={styles.rememberRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span style={{ marginLeft: 8 }}>Remember this device</span>
          </div>

          {/* Mensaje de error */}
          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.signInButton}>
            Sign In →
          </button>
        </form>

        <div style={styles.secureLogin}>SECURE LOGIN</div>

        <button style={styles.backButton} onClick={() => router.push("/")}>
          ← Back to main landing page
        </button>
      </div>

      {/* Pie de página */}
      <footer style={styles.footer}>
        <p>© 2024 CRM Corporate System. All rights reserved.</p>
        <div>
          <a style={styles.footerLink}>Privacy Policy</a>
          <a style={styles.footerLink}>Terms of Service</a>
          <a style={styles.footerLink}>Security Standards</a>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    width: "100%",
    padding: "16px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  logoText: {
    fontWeight: 600,
    fontSize: 16,
  },
  headerActions: {
    display: "flex",
    gap: "10px",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#374151",
    cursor: "pointer",
  },
  helpButton: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  card: {
    marginTop: 60,
    backgroundColor: "#ffffff",
    padding: 40,
    borderRadius: 12,
    width: 400,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  lockIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  title: {
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    textAlign: "left",
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
  },
  input: {
    padding: "10px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  passwordRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotPassword: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: 12,
    cursor: "pointer",
  },
  rememberRow: {
    display: "flex",
    alignItems: "center",
    fontSize: 13,
  },
  signInButton: {
    marginTop: 10,
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
  secureLogin: {
    marginTop: 20,
    fontSize: 11,
    color: "#9ca3af",
  },
  backButton: {
    marginTop: 10,
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: 13,
    cursor: "pointer",
  },
  footer: {
    marginTop: "auto",
    padding: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
  },
  footerLink: {
    margin: "0 8px",
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "10px",
    borderRadius: 6,
    fontSize: 14,
    textAlign: "center",
    border: "1px solid #fecaca",
  },
};
