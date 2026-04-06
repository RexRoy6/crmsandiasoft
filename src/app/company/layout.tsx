"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";

const TOPBAR_HEIGHT = 60;
const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 70;

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <>
      <Topbar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Sidebar collapsed={collapsed} />

      <div
        style={{
          marginTop: TOPBAR_HEIGHT,
          marginLeft: sidebarWidth,
          minHeight: "100vh",
          background: "var(--bg-secondary)",
          transition: "margin-left 0.2s ease",
        }}
      >
        <main
          style={{
            padding: 40,
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}
