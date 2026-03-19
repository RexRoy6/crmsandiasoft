type Props = {
  form: any;
  setForm: (v: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function InlineClientForm({
  form,
  setForm,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: 12,
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        background: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
        style={inputStyle}
      />

      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) =>
          setForm({ ...form, phone: e.target.value })
        }
        style={inputStyle}
      />

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSubmit} style={primaryBtn}>
          Create
        </button>

        <button onClick={onCancel} style={secondaryBtn}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid var(--border-color)",
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
};

const primaryBtn = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid var(--border-color)",
  background: "transparent",
  color: "var(--text-primary)",
  cursor: "pointer",
};