import { ReactNode } from "react"

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "time" | "textarea";
  options?: { value: string; label: string }[];
  onChange?: (value: string) => void;
  readOnly?: boolean;
  after?: ReactNode;
};

type Props = {
  title: string;
  fields: Field[];
  form: any;
  setForm: (value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function CreateForm({
  title,
  fields,
  form,
  setForm,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        padding: 24,
        borderRadius: 12,
        marginBottom: 30,
        border: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 500,
      }}
    >
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        {title}
      </h3>

      {fields.map((field) => {
        if (field.type === "select") {
          return (
            <div
              key={field.name}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                {field.label}
              </label>

              <select
                value={form[field.name] || ""}
                onChange={(e) => {
                  const value = e.target.value;

                  if (field.onChange) {
                    field.onChange(value);
                  } else {
                    setForm({
                      ...form,
                      [field.name]: value,
                    });
                  }
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Select...</option>

                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* 👇 AQUI VA EL BOTÓN */}
              {field.after && (
                <div style={{ marginTop: 4 }}>
                  {field.after}
                </div>
              )}
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div
              key={field.name}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                {field.label}
              </label>

              <textarea
                value={form[field.name] || ""}
                rows={4}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [field.name]: e.target.value,
                  })
                }
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          );
        }

        return (
          <div
            key={field.name}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <label
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              {field.label}
            </label>

            <input
              type={field.type || "text"}
              value={form[field.name] || ""}
              readOnly={field.readOnly}
              onChange={(e) =>
                setForm({
                  ...form,
                  [field.name]:
                    field.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                })
              }
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        );
      })}


   
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 10,
        }}
      >
        <button
          onClick={onSubmit}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Create
        </button>

        <button
          onClick={onCancel}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}