"use client";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 2; // páginas alrededor de la actual
    const range = [];

    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const pages = getPages();

  return (
    <div
      style={{
        marginTop: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#ffffff",
          padding: 8,
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "none",
            background: page === 1 ? "#f1f5f9" : "#e2e8f0",
            color: "#334155",
            cursor: page === 1 ? "not-allowed" : "pointer",
          }}
        >
          ←
        </button>

        {/* First */}
        {pages[0] > 1 && (
          <>
            <PageButton page={1} current={page} onClick={onPageChange} />
            {pages[0] > 2 && <span style={{ padding: "0 4px" }}>...</span>}
          </>
        )}

        {/* Middle pages */}
        {pages.map((p) => (
          <PageButton key={p} page={p} current={page} onClick={onPageChange} />
        ))}

        {/* Last */}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span style={{ padding: "0 4px" }}>...</span>
            )}
            <PageButton
              page={totalPages}
              current={page}
              onClick={onPageChange}
            />
          </>
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "none",
            background: page === totalPages ? "#f1f5f9" : "#e2e8f0",
            color: "#334155",
            cursor: page === totalPages ? "not-allowed" : "pointer",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

function PageButton({
  page,
  current,
  onClick,
}: {
  page: number;
  current: number;
  onClick: (page: number) => void;
}) {
  const isActive = page === current;

  return (
    <button
      onClick={() => onClick(page)}
      style={{
        minWidth: 32,
        height: 32,
        borderRadius: 8,
        border: "none",
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        background: isActive ? "#2563eb" : "transparent",
        color: isActive ? "#ffffff" : "#334155",
        cursor: "pointer",
      }}
    >
      {page}
    </button>
  );
}
