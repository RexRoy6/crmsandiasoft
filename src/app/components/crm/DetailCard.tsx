"use client";

import Link from "next/link";

type Field = {
  name: string;
  label: string;
  type?: string;
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
  onReactivate?: () => void;
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
}: any) {
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 400,
      }}
    >
      <h2>{title}</h2>

      {/* VIEW MODE */}
      {!editing && (
        <>
          {fields.map((field: any) => (
            <p key={field.name}>
              <strong>{field.label}:</strong> {data[field.name]}
            </p>
          ))}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setEditing(true)}>Edit</button>

            <button
              onClick={onDelete}
              style={{ background: "red", color: "white" }}
            >
              Delete
            </button>

            {actions.map((action: any, index: number) => (
              <Link key={index} href={action.href}>
                <button>{action.label}</button>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* EDIT MODE */}
      {editing && (
        <>
          {fields.map((field: any) => (
            <input
              key={field.name}
              value={form[field.name]}
              placeholder={field.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  [field.name]: e.target.value,
                })
              }
            />
          ))}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>

            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}