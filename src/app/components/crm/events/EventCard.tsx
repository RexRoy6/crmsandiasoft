"use client";

import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils/date";
import type { EventListItem } from "@/types/event";
import { 
  CalendarDays, 
  MapPin, 
  AlignLeft, 
  FileText, 
  Settings2 
} from "lucide-react";

interface Props {
  event: EventListItem;
}

export default function EventCard({ event }: Props) {
  const router = useRouter();
  const contract = event.contract;

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
      
      {/* HEADER: Etiqueta de Cliente y Título */}
      <div className="mb-4">
        <div 
          className="inline-block px-2.5 py-1 mb-3 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md max-w-full truncate"
          title={event.client.name}
        >
          {event.client.name}
        </div>
        <h3 
          className="text-lg font-black text-gray-900 leading-tight line-clamp-2 break-all"
          title={event.name}
        >
          {event.name}
        </h3>
      </div>

      {/* BODY: Detalles con Iconos */}
      <div className="flex flex-col gap-3.5 flex-grow mb-6">
        
        {/* Fecha y Hora */}
        <div className="flex items-start gap-3">
          <CalendarDays className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-gray-900">
              {formatDate(event.eventDate)}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(event.eventStart)} - {formatTime(event.eventEnd)}
            </span>
          </div>
        </div>

        {/* Ubicación */}
        {event.location && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span 
              className="text-[13px] text-gray-700 line-clamp-2 break-all leading-snug"
              title={event.location}
            >
              {event.location}
            </span>
          </div>
        )}

        {/* Notas */}
        {event.notes && (
          <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <AlignLeft className="w-3 h-3" />
              Notas
            </div>
            <p className="text-xs text-gray-600 line-clamp-3 break-all leading-relaxed">
              {event.notes}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER: Botones de Acción */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-2.5">
        {contract && (
          <button
            onClick={() => router.push(`/company/contracts/${contract.id}/services`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            Servicios
          </button>
        )}
        
        <button
          onClick={() => router.push(`/company/clients/${event.client.id}/events/${event.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-xs font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          <Settings2 className="w-3.5 h-3.5 opacity-70" />
          Detalles
        </button>
      </div>

    </div>
  );
}