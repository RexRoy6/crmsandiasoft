"use client";

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
  onReactivate,
}: Props) {
  return (
    <div
      style={{
        background: "black",
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 400,
      }}
    >
      {/* VIEW MODE */}

      {!editing && (
        <>
          <h2>{title}</h2>

          {fields.map((field) => (
            <p key={field.name}>
              <strong>{field.label}: </strong>
              {data[field.name]}
            </p>
          ))}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setEditing(true)}>Edit</button>

            {onDelete && (
              <button
                onClick={onDelete}
                style={{ background: "red", color: "white" }}
              >
                Delete
              </button>
            )}

            {data.deletedAt && onReactivate && (
              <button onClick={onReactivate}>Reactivate</button>
            )}
          </div>
        </>
      )}

      {/* EDIT MODE */}

      {editing && (
        <>
          <h2>Edit {title}</h2>

          {fields.map((field) => (
            <input
              key={field.name}
              type={field.type || "text"}
              value={form[field.name]}
              placeholder={field.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  [field.name]:
                    field.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
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