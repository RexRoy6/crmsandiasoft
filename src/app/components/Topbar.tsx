"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Topbar() {
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
    } catch {}
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
      style={{
        height: 60,
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "white",
      }}
    >
      <strong>CRM Dashboard</strong>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {user && (
          <span>
            {user.email} — <strong>{user.companyName}</strong>
          </span>
        )}

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}