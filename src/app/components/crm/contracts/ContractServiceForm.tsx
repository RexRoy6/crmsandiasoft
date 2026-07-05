"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/utils/date";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import { Plus, PackageSearch } from "lucide-react";

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
      fullWidth: true, // Ocupa las 2 columnas para que el nombre del servicio se lea bien
      options: companyServices.map((s) => ({
        value: String(s.id),
        label: `${s.name} ($${s.priceBase})`,
      })),
      onChange: handleServiceChange,
      required: true,
    },
    {
      name: "quantity",
      label: "Cantidad",
      type: "number",
      required: true,
    },
    {
      name: "unitPrice",
      label: "Precio Unitario",
      type: "number",
    },
    {
      name: "operationStart",
      label: "Hora de Inicio (Montaje)",
      type: "time",
      required: true,
    },
    {
      name: "operationEnd",
      label: "Hora de Fin (Desmontaje)",
      type: "time",
      required: true,
    },
    {
      name: "serviceNotes",
      label: "Notas Adicionales",
      type: "textarea",
    },
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
    <div className="mb-6">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Agregar Servicio
        </button>
      )}

      {showForm && (
        <div className="mt-4 bg-gray-50/50 p-1 md:p-4 rounded-2xl border border-gray-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ease-out">
          <CreateForm
            title="Detalles del Servicio"
            fields={fields}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Agregar al Contrato"
          />
          
          {/* Tarjeta Informativa del Servicio Seleccionado */}
          {selectedService && (
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <PackageSearch size={16} className="text-blue-500" />
                  Inventario y Disponibilidad
                </div>
                <div className="text-xs text-gray-500">
                  Fecha del evento: {formatDate(contract?.event?.eventDate)}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  Stock base disponible: <strong>{selectedService.stockTotal} unidades</strong>
                </div>
              </div>

              {subtotal > 0 && (
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-right">
                  <div className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-0.5">Subtotal</div>
                  <div className="text-lg font-bold text-gray-900">{formatMoney(subtotal)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}