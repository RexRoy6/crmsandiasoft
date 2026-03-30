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
  Settings
} from "lucide-react";

const menu = [
  {
    label: "Home",
    href: "/company",
    icon: Home,
  },
  {
    label: "Services",
    href: "/company/service",
    icon: Briefcase,
  },
  {
    label: "Clients",
    href: "/company/clients",
    icon: Users,
  },
  {
    label: "Events",
    href: "/company/events",
    icon: AlarmClock,
  },
  {
    label: "Contracts",
    href: "/company/contracts",
    icon: FileText,
  },
  {
    label: "Payments",
    href: "/company/payments",
    icon: CreditCard,
  },
  {
    label: "Calendar",
    href: "/company/calendar",
    icon: Calendar,
  },
   {
    label: "Settings",
    href: "/company/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        height: "100vh",
        borderRight: "1px solid var(--border-color)",
        background: "var(--bg-primary)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 30,
      }}
    >
      <h2 style={{ fontSize: 18 }}>Options menu</h2>

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
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                color: active ? "white" : "var(--text-primary)",
                background: active ? "#2563eb" : "transparent",
                fontSize: 14,
              }}
            >
              <Icon size={18} />

              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
