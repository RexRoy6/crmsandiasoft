"use client";

import Link from "next/link";

type Field = {
  name: string;
  label: string;
  type?: string;
};

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type Props = {
  title: string;
  fields: Field[];
  data: any;
  form: any;
  setForm: (v: any) => void;
  editing: boolean;
  setEditing: (v: boolean) => void;
  saving: boolean;
  onSave: () => void;
  onDelete?: () => void;
  actions?: Action[];
};

export default function DetailCard({
  title,
  fields,
  data,
  form,
  setForm,
  editing,
  setEditing,
  saving,
  onSave,
  onDelete,
  actions = [],
}: Props) {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        padding: 24,
        borderRadius: 12,
        marginTop: 20,
        border: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 500,
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        {title}
      </h2>

      {/* VIEW MODE */}
      {!editing && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {fields.map((field) => {
              if (field.name === "notes") {
                return (
                  <div key={field.name}>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {field.label}
                    </span>

                    <div
                      style={{
                        marginTop: 6,
                        padding: 10,
                        borderRadius: 8,
                        background: "var(--bg-secondary)",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {data[field.name]}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={field.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: 6,
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {field.label}
                  </span>

                  <strong style={{ color: "var(--text-primary)" }}>
                    {data[field.name]}
                  </strong>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                cursor: "pointer",
              }}
            >
              Edit
            </button>

            {onDelete && (
              <button
                onClick={onDelete}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}

            {actions.map((action, index) => {
              if (action.href) {
                return (
                  <Link key={index} href={action.href}>
                    <button
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      {action.label}
                    </button>
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* EDIT MODE */}
      {editing && (
        <>
          {fields.map((field) => (
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

              {field.name === "notes" ? (
                <textarea
                  value={form[field.name] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [field.name]: e.target.value,
                    })
                  }
                  rows={4}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    resize: "vertical",
                  }}
                />
              ) : (
                <input
                  type={field.type || "text"}
                  value={form[field.name] || ""}
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
              )}
            </div>
          ))}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
            }}
          >
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => setEditing(false)}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}