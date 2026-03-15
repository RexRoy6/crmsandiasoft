"use client";

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search..."
}: Props) {

  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        maxWidth: 400,
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        marginBottom: 15
      }}
    />
  )

}