type Props = {
  title: string;
  buttonLabel?: string;
  onClick?: () => void;
};

export default function PageHeader({
  title,
  buttonLabel,
  onClick,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 12,
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      {/* TITLE */}

      <h1
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h1>

      {/* ACTION BUTTON */}

      {buttonLabel && onClick && (
        <button
          onClick={onClick}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            fontSize: 14,
            cursor: "pointer",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}