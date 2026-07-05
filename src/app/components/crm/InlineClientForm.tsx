"use client";

type Props = {
  form: { name: string; phone: string; email: string };
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
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-bold text-gray-900 tracking-tight mb-1">
        Registrar Nuevo Cliente
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre - Ocupa 2 columnas */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
            Nombre Completo <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            placeholder="Ej. Juan Pérez"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm"
          />
        </div>

        {/* Teléfono - Ocupa 1 columna */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
            Teléfono <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            placeholder="Ej. 555 123 4567"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm"
          />
        </div>

        {/* Correo - Ocupa 1 columna */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-700 mb-1.5">
            Correo Electrónico
          </label>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-3 mt-2 pt-4 border-t border-gray-200">
        <button
          onClick={onSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all shadow-sm"
        >
          Guardar Cliente
        </button>
        
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}