"use client";

import { ReactNode } from "react";

export type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "select"
    | "date"
    | "time"
    | "datetime-local"
    | "textarea";
  options?: { value: string; label: string }[];
  onChange?: (value: string) => void;
  readOnly?: boolean;
  hideInput?: boolean;
  required?: boolean;
  after?: ReactNode;
  // Propiedad nueva para control manual del ancho en la cuadrícula
  fullWidth?: boolean; 
};

type Props = {
  title: string;
  fields: Field[];
  form: any;
  setForm: (value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  clearError?: () => void;
  submitLabel?: string;
  loading?: boolean;
};

export default function CreateForm({
  title,
  fields,
  form,
  setForm,
  onSubmit,
  onCancel,
  clearError,
  submitLabel = "Guardar",
  loading = false,
}: Props) {
  function handleFieldChange(field: Field, value: string) {
    clearError?.();

    if (field.onChange) {
      field.onChange(value);
      return;
    }

    setForm((prev: any) => ({
      ...prev,
      [field.name]: field.type === "number" ? Number(value) : String(value),
    }));
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 mb-8 w-full shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 tracking-tight">
        {title}
      </h3>

      {/* CUADRÍCULA INTELIGENTE: 1 columna en móvil, 2 en escritorio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-6">
        {fields.map((field) => {
          // Lógica de Sizing: Textareas o fullWidth explícito ocupan 2 columnas
          const isFullWidth = field.type === "textarea" || field.fullWidth;
          const colSpanClass = isFullWidth ? "md:col-span-2" : "col-span-1";

          const Label = () => (
            <label className="text-sm font-medium text-gray-500 mb-1.5 flex items-center tracking-tight">
              {field.label}
              {field.required && (
                <span className="text-red-500 ml-1.5 font-bold">*</span>
              )}
            </label>
          );

          {/* ---------- SELECT ---------- */}
          if (field.type === "select") {
            return (
              <div key={field.name} className={`flex flex-col ${colSpanClass}`}>
                <Label />
                <select
                  required={field.required}
                  value={form[field.name] ?? ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm"
                >
                  <option value="">Seleccionar...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {field.after && <div className="mt-1.5">{field.after}</div>}
              </div>
            );
          }

          {/* ---------- TEXTAREA ---------- */}
          if (field.type === "textarea") {
            return (
              <div key={field.name} className={`flex flex-col ${colSpanClass}`}>
                <Label />
                <textarea
                  required={field.required}
                  value={form[field.name] ?? ""}
                  rows={3}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm resize-y"
                />
                {field.after && <div className="mt-1.5">{field.after}</div>}
              </div>
            );
          }

          {/* ---------- INPUT DEFAULT ---------- */}
          return (
            <div key={field.name} className={`flex flex-col ${colSpanClass}`}>
              <Label />
              {!field.hideInput && (
                <input
                  required={field.required}
                  type={field.type || "text"}
                  value={form[field.name] ?? ""}
                  readOnly={field.readOnly}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className={`
                    w-full px-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 transition-all shadow-sm
                    ${
                      field.readOnly
                        ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black"
                    }
                  `}
                />
              )}
              {field.after && <div className="mt-1.5">{field.after}</div>}
            </div>
          );
        })}
      </div>

      {/* ---------- ACTIONS (Footer con línea divisoria) ---------- */}
      <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-gray-100">
        <button
          onClick={onSubmit}
          disabled={loading}
          className={`
            px-6 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
            ${
              loading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
            }
          `}
        >
          {loading ? "Guardando..." : submitLabel}
        </button>

        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-lg font-medium text-sm border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}