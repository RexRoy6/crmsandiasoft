"use client";

type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  page,
  totalPages,
  onPageChange
}: Props) {

  if (totalPages <= 1) return null // 🔥 no mostrar si no hay más páginas

  return (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        alignItems: "center",
        gap: 10
      }}
    >

      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>

    </div>
  )
}