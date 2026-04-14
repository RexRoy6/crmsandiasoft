"use client";

import { useRouter } from "next/navigation";
import React from "react";

type Badge = {
  label: string;
};

type Action = {
  label: string;
  onClick?: () => void;
  color?: string;
};

type MetaItem = {
  icon?: React.ReactNode;
  label: string;
};

type ListCardProps = {
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;

  meta?: MetaItem[];
  badge?: Badge;

  actions?: Action[];

  link?: string;
  onClick?: () => void;

  children?: React.ReactNode;
};

export default function ListCard({
  title,
  subtitle,
  content,
  meta = [],
  badge,
  actions = [],
  link,
  onClick,
  children,
}: ListCardProps) {
  const router = useRouter();

  const badgeStyles: Record<string, { background: string; color: string }> = {
    paid: { background: "#dcfce7", color: "#166534" },
    completed: { background: "#dcfce7", color: "#166534" },
    active: { background: "#8eb4ff", color: "#0e4685" },
    pending: { background: "#fef9c3", color: "#854d0e" },
    partial: { background: "#fef9c3", color: "#854d0e" },
    cancelled: { background: "#fee2e2", color: "#991b1b" },
  };

  const getBadgeStyles = () => {
    return (
      badgeStyles[badge?.label || ""] || {
        background: "#e2e8f0",
        color: "#334155",
      }
    );
  };
  // const getBadgeStyles = () => {
  //   switch (badge?.label) {
  //     case "paid" :
  //       return { background: "#dcfce7", color: "#166534" };
  //     case "pending":
  //       return { background: "#fef3c7", color: "#92400e" };
  //     case "cancel":
  //       return { background: "#fee2e2", color: "#991b1b" };
  //     default:
  //       return { background: "#e5e7eb", color: "#374151" };
  //   }
  // };

  const handleClick = () => {
    if (onClick) return onClick();
    if (link) return router.push(link);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
        cursor: link || onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        marginBottom: 12,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* HEADER */}
      {(title || actions.length > 0) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {title && (
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {title}
              </h3>
            )}

            {badge && (
              <span
                style={{
                  ...getBadgeStyles(),
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontWeight: 500,
                }}
              >
                {badge.label}
              </span>
            )}
          </div>

          {actions.length > 0 && (
            <div style={{ display: "flex", gap: 8 }}>
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.();
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: action.color || "#e5e7eb",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTITLE */}
      {subtitle && (
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: 13,
            color: "#6b7280",
          }}
        >
          {subtitle}
        </p>
      )}

      {/* CONTENT */}
      {content && (
        <div
          style={{
            background: "#f9fafb",
            padding: 10,
            borderRadius: 8,
            fontSize: 13,
            color: "#374151",
            marginBottom: 10,
          }}
        >
          {content}
        </div>
      )}

      {/* META */}
      {meta.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          {meta.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#6b7280",
                background: "#f3f4f6",
                padding: "4px 8px",
                borderRadius: 6,
              }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* CHILDREN (extensión libre) */}
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}
