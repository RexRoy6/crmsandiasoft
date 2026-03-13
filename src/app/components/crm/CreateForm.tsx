export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" |"date"|"textarea";
  options?: { value: string; label: string }[];
  onChange?: (value: string) => void;
  readOnly?: boolean;
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
        background: "green",
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h3>{title}</h3>

      {fields.map((field) => {
  if (field.type === "select") {
    return (
      <div key={field.name} style={{ marginBottom: 10 }}>
        <label>{field.label}</label>

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
        >
          <option value="">Select...</option>

          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div key={field.name} style={{ marginBottom: 10 }}>
      <input
        type={field.type || "text"}
        placeholder={field.label}
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
      />
    </div>
  );
})}

      <button onClick={onSubmit}>Create</button>

      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}