"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/utils/date";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import { Plus, PackageSearch, X } from "lucide-react";

type Props = {
  companyServices: any[];
  contract: any;
  onSubmit: (data: any) => Promise<boolean | void>;
};

const initialForm = {
  serviceId: "",
  quantity: "",
  unitPrice: "",
  serviceNotes: "",
  operationStart: "",
  operationEnd: "",
};

export default function ContractServiceForm({
  companyServices,
  contract,
  onSubmit,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  const handleServiceChange = (serviceId: string) => {
    const service = companyServices.find((s) => String(s.id) === serviceId);
    if (!service) return;

    setForm((prev) => ({
      ...prev,
      serviceId,
      unitPrice: String(service.priceBase),
    }));
  };

  const fields: Field[] = [
    {
      name: "serviceId",
      label: "Servicio / Equipo",
      type: "select",
      fullWidth: true,
      options: companyServices.map((s) => ({
        value: String(s.id),
        label: `${s.name} ($${s.priceBase})`,
      })),
      onChange: handleServiceChange,
      required: true,
    },
    { name: "quantity", label: "Cantidad", type: "number", required: true },
    { name: "unitPrice", label: "Precio Unitario", type: "number" },
    { name: "operationStart", label: "Hora de Inicio (Montaje)", type: "time", required: true },
    { name: "operationEnd", label: "Hora de Fin (Desmontaje)", type: "time", required: true },
    { name: "serviceNotes", label: "Notas Adicionales", type: "textarea", fullWidth: true },
  ];

  const selectedService = useMemo(() => {
    return companyServices.find((s) => String(s.id) === form.serviceId);
  }, [companyServices, form.serviceId]);

  const subtotal = Number(form.quantity || 0) * Number(form.unitPrice || 0);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  };

  async function handleSubmit() {
    const success = await onSubmit(form);
    if (!success) return;
    setShowForm(false);
    setForm(initialForm);
  }

  function handleCancel() {
    setShowForm(false);
    setForm(initialForm);
  }

  return (
    <div className="w-full mb-8">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex flex-col items-center justify-center gap-2 py-8 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          <div className="bg-white p-2 rounded-full shadow-sm">
            <Plus size={20} className="text-gray-900" />
          </div>
          <span className="font-semibold text-sm">Añadir Nuevo Servicio</span>
        </button>
      ) : (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-gray-900">Configurar Servicio</h3>
             <button onClick={handleCancel} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
               <X size={20} />
             </button>
          </div>

          <CreateForm
            title="" // Quitamos el título interno para evitar redundancia
            fields={fields}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Agregar al Contrato"
          />

          {selectedService && (
            <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <PackageSearch size={16} />
                  Disponibilidad en Inventario
                </div>
                <div className="text-xs text-blue-700">
                  Fecha: {formatDate(contract?.event?.eventDate)}
                </div>
                <div className="text-sm text-blue-800 mt-1">
                  Stock base: <strong>{selectedService.stockTotal} unidades</strong>
                </div>
              </div>

              {subtotal > 0 && (
                <div className="bg-white px-4 py-2 rounded-lg border border-blue-100 text-right shadow-sm">
                  <div className="text-xs font-medium text-blue-500 uppercase tracking-wider mb-0.5">
                    Subtotal Estimado
                  </div>
                  <div className="text-lg font-black text-gray-900">
                    {formatMoney(subtotal)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}