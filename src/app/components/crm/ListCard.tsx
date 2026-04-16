"use client";

import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  extra?: string[];
  link: string;
  isActive?: boolean;
};

export default function ListCard({
  title,
  description,
  extra,
  link,
  isActive = true,
}: Props) {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        padding: 20,
        borderRadius: 12,
        border: isActive
          ? "1px solid var(--border-color)"
          : "1px solid #ff4d4f", //inactive
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "all 0.15s ease",
        opacity: isActive ? 1 : 0.6, //se ve "apagado"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* TITLE */}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <strong
          style={{
            fontSize: 16,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </strong>

        {!isActive && (
          <span
            style={{
              background: "#ff4d4f",
              color: "white",
              fontSize: 12,
              padding: "2px 6px",
              borderRadius: 6,
            }}
          >
            Inactive
          </span>
        )}
      </div>

      {/* DESCRIPTION */}

      {description && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
          }}
        >
          {description}
        </p>
      )}

      {/* EXTRA INFO */}

      {extra && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 14,
            color: "var(--text-secondary)",
          }}
        >
          {extra.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      )}

      {/* ACTION */}

      <div style={{ marginTop: 10 }}>
        <Link href={link}>
          <button
            style={{
              padding: "6px 12px",
              fontSize: 13,
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              cursor: "pointer",
            }}
          >
            Manage →
          </button>
        </Link>
      </div>
    </div>
  );
}