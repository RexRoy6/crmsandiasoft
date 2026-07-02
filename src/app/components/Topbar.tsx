"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

interface TopbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Topbar({ collapsed, onToggle }: TopbarProps) {
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border-color bg-bg-primary px-4 shadow-sm md:px-6">
      
      {/* Lado Izquierdo: Botón Menú + Título */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="rounded-md p-2 text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary md:hidden"
          aria-label="Toggle Menu"
        >
          <Menu size={22} />
        </button>

        <strong className="hidden text-base text-text-primary sm:block">
          CRM Dashboard
        </strong>
      </div>

      {/* Lado Derecho: Datos del Usuario + Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <span className="hidden text-sm text-text-secondary md:block">
            {user.email} — <strong className="text-text-primary">{user.companyName}</strong>
          </span>
        )}

        <button
          onClick={logout}
          className="rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-sm font-medium text-text-primary transition-all duration-200 hover:border-error-border hover:bg-error-bg hover:text-error-color"
        >
          Logout
        </button>
      </div>
    </header>
  );
}