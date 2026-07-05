"use client";

import ContractItemCard from "@/app/components/crm/ContractItemCard";
import { Loader2, PackageX } from "lucide-react";

type Props = {
  services: any[];
  loading: boolean;
  onDelete: (itemId: number) => Promise<void>;
  onUpdate: (itemId: number, data: any) => Promise<void>;
};

export default function ContractServicesList({
  services,
  loading,
  onDelete,
  onUpdate,
}: Props) {
  
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando servicios contratados...
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
        <PackageX className="w-8 h-8 text-gray-400" />
        <p className="text-sm font-medium text-gray-600">No hay servicios agregados.</p>
        <p className="text-xs text-gray-400">Utiliza el botón superior para añadir el primer servicio.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-2">
      {services.map((item) => (
        <ContractItemCard
          key={item.id}
          item={item}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}