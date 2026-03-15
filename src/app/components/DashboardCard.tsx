export default function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        padding: 20,
        borderRadius: 12,
        border: "1px solid var(--border-color)",
        minWidth: 180,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 6px 16px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          fontWeight: 500,
        }}
      >
        {title}
      </span>

      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
    </div>
  );
}