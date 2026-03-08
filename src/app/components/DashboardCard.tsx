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
        background: "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 14, color: "#777" }}>{title}</div>

      <div
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginTop: 8,
        }}
      >
        {value}
      </div>
    </div>
  );
}