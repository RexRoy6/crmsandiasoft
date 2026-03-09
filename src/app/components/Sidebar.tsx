"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div
      style={{
        width: 240,
        background: "#2f4f78",
        color: "white",
        height: "100vh",
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 40 }}>CRM</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link href="/company">Home</Link>
        <Link href="/company/service">Services</Link>
        <Link href="/company/clients">Clients</Link>

        {/* future */}
        {/* <Link href="/company/clients">Clients</Link>
        <Link href="/company/events">Events</Link> */}
      </nav>
    </div>
  );
}