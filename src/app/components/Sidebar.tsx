"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Briefcase,
  AlarmClock,
  Settings,
  Star
} from "lucide-react";

const menu = [
  { label: "Home", href: "/company", icon: Home },
  { label: "Registro Rapido", href: "/company/contracts/new", icon: Star },
  { label: "Services", href: "/company/service", icon: Briefcase },
  { label: "Clients", href: "/company/clients", icon: Users },
  { label: "Events", href: "/company/events", icon: AlarmClock },
  { label: "Contracts", href: "/company/contracts", icon: FileText },
  { label: "Payments", href: "/company/payments", icon: CreditCard },
  { label: "Calendar", href: "/company/calendar", icon: Calendar },
  { label: "Settings", href: "/company/settings", icon: Settings },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const width = collapsed ? 70 : 220;

  return (
    <aside
      className="sidebar-container"
      style={{
        width: width,
        padding: collapsed ? "15px" : "15px",
      }}
    >
      {collapsed ? (
        <h2 style={{ fontSize: 16, margin: 0, alignSelf: "left" }}>Menu</h2>
      ) : (
        <h2 style={{ fontSize: 16, margin: 0, alignSelf: "left" }}>
          Options menu
        </h2>
      )}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 10,

                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",

                color: active ? "white" : "var(--text-primary)",
                background: active ? "#2563eb" : "transparent",

                fontSize: 14,
              }}
            >
              <span title={item.label}>
                <Icon size={18} />
              </span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
