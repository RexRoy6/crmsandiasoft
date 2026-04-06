"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import "../globals.css";

export default function Topbar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/company/me", {
        credentials: "include",
      });

      if (res.status === 401) {
        router.replace("/");
        return;
      }

      if (!res.ok) return;

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Network error fetching user:", error);

      // fallback: go to login
      router.replace("/");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div
      className="topbar-container"
      style={{ background: "var(--background)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onToggle}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Menu size={22} />
        </button>

        <strong style={{ fontSize: 16 }}>CRM Dashboard </strong>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {user && (
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            {user.email} — <strong>{user.companyName}</strong>
          </span>
        )}

        <button
          onClick={logout}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
