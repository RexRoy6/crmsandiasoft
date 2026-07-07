"use client";

import { formatDate, formatTime } from "@/lib/utils/date";
import ContractServicesList from "./ContractServicesList"; // Importamos la lista

type Props = {
  contract: any;
  services: any[];
  companyServices: any[];
  loadingServices: boolean;
  onDeleteService: (id: number) => Promise<void>;
  onUpdateService: (id: number, data: any) => Promise<void>;
};

export default function ContractSummaryCard({ 
  contract, 
  services, 
  companyServices,
  loadingServices, 
  onDeleteService, 
  onUpdateService 
}: Props) {
  if (!contract) return null;

  const isDraft = contract.status === "draft";

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg mb-6 relative overflow-hidden">
      
      {/* Efecto visual de borde superior tipo ticket */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-900"></div>

      {/* Cabecera de la Tarjeta */}
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-dashed border-gray-300">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          Recibo Previsto #{contract.id}
        </h2>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
            ${isDraft ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}
          `}
        >
          {contract.status === "draft" ? "Borrador" : "Activo"}
        </span>
      </div>

      {/* Cuadrícula de Datos Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-gray-700 mb-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</span>
          <span className="font-semibold text-gray-900">{contract.client?.name}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Evento</span>
          <span className="font-semibold text-gray-900">{contract.event?.name}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha y Hora</span>
          <span className="text-gray-900">
            {formatDate(contract.event?.eventDate)} <span className="text-gray-300 mx-1">|</span>
            {formatTime(contract.event?.eventStart)} - {formatTime(contract.event?.eventEnd)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ubicación</span>
          <span className="text-gray-900 truncate" title={contract.event?.location}>
            {contract.event?.location || "No especificada"}
          </span>
        </div>
      </div>

      {/* Desglose de Servicios (Inyectado aquí adentro) */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
          Desglose de Servicios
        </h3>
        <ContractServicesList 
          services={services} 
          companyServices={companyServices}
          loading={loadingServices} 
          onDelete={onDeleteService} 
          onUpdate={onUpdateService} 
        />
      </div>

      {/* Total Acumulado */}
      <div className="mt-2 pt-6 border-t-[3px] border-gray-900 flex justify-between items-end">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Total del Contrato
        </span>
        <span className="text-3xl font-black text-gray-900 tracking-tight">
          {formatMoney(Number(contract.totalAmount || 0))}
        </span>
      </div>
    </div>
  );
}