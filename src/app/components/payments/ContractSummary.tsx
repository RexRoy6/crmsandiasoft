"use client";

export default function ContractSummary({
  total,
  paid,
  remaining,
}: {
  total: number;
  paid: number;
  remaining: number;
}) {
  const progress = total > 0 ? (paid / total) * 100 : 0;

  return (
    <div
      style={{
        background: "var(--bg-primary)",
        padding: 20,
        borderRadius: 12,
        border: "1px solid var(--border-color)",
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 500,
      }}
    >
      <strong>Contract Summary</strong>

      <div>
        <span style={{ color: "var(--text-secondary)" }}>Total:</span> ${total}
      </div>

      <div>
        <span style={{ color: "var(--text-secondary)" }}>Paid:</span> ${paid}
      </div>

      <div>
        <span style={{ color: "var(--text-secondary)" }}>Remaining:</span> ${remaining}
      </div>

      {/* progress bar */}
      <div
        style={{
          marginTop: 10,
          height: 8,
          borderRadius: 6,
          background: "var(--bg-secondary)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            background: "#22c55e",
            height: "100%",
          }}
        />
      </div>

      <span
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
        }}
      >
        {progress.toFixed(0)}% paid
      </span>
    </div>
  );
}