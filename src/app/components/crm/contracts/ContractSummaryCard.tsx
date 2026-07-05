"use client";

import { formatDate, formatTime } from "@/lib/utils/date";

type Props = {
  contract: any;
};

export default function ContractSummaryCard({ contract }: Props) {
  if (!contract) return null;

  const isDraft = contract.status === "draft";

  // Formateador nativo para moneda (México)
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { 
      style: "currency", 
      currency: "MXN" 
    }).format(amount);
  };

  return (
    <div className="bg-gray-50 p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
      
      {/* Cabecera de la Tarjeta */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          Contrato #{contract.id}
        </h2>
        
        <span
          className={`
            px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
            ${isDraft ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}
          `}
        >
          {contract.status === "draft" ? "Borrador" : "Activo"}
        </span>
      </div>

      {/* Cuadrícula de Datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</span>
          <span className="font-semibold text-gray-900">{contract.client?.name}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</span>
          <span className="font-semibold text-gray-900">{contract.event?.name}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</span>
          <span className="text-gray-900">
            {formatDate(contract.event?.eventDate)} <span className="text-gray-400 mx-1">|</span> 
            {formatTime(contract.event?.eventStart)} - {formatTime(contract.event?.eventEnd)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</span>
          <span className="text-gray-900 truncate" title={contract.event?.location}>
            {contract.event?.location || "No especificada"}
          </span>
        </div>
      </div>
      
      {/* Total Acumulado */}
      <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end">
        <div className="text-right">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-3">Total Estimado</span>
          <span className="text-xl font-black text-gray-900">
            {formatMoney(Number(contract.totalAmount || 0))}
          </span>
        </div>
      </div>

    </div>
  );
}