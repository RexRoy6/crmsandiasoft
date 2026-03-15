"use client";

import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  extra?: string[];
  link: string;
};

export default function ListCard({
  title,
  description,
  extra,
  link,
}: Props) {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        padding: 20,
        borderRadius: 12,
        border: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "all 0.15s ease",
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

      <strong
        style={{
          fontSize: 16,
          color: "var(--text-primary)",
        }}
      >
        {title}
      </strong>

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