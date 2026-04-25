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
  isActive?: boolean;
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
  isActive = true,
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
    const label = badge?.label || "";
    const baseStyle = badgeStyles[label];

    if (!isActive) {
      return {
        background: "#ff4d4f",
        color: "white",
      };
    }
    if (baseStyle) return baseStyle;

    return {
      background: "#e2e8f0",
      color: "#334155",
    };
  };

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
        border: isActive
          ? "1px solid var(--border-color)"
          : "1px solid #ff4d4f",
        cursor: link || onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        marginBottom: 12,
        opacity: isActive ? 1 : 0.6,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
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

            {(badge || !isActive) && (
              <span
                style={{
                  ...getBadgeStyles(),
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontWeight: 500,
                }}
              >
                {badge?.label || "Inactive"}
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
                    background: "var(--text-primary)",
                    color: "var(--bg-primary)",
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
            background: "var(--bg-secondary)",
            padding: 10,
            borderRadius: 8,
            fontSize: 13,
            color: "var(--text-primary)",
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
