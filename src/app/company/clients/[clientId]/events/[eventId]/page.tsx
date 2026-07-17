"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, FileText, Plus, RefreshCcw } from "lucide-react";
import DetailCard from "@/app/components/crm/DetailCard";
import ErrorBox from "@/app/components/ErrorBox";
import type { Field } from "@/app/components/crm/CreateForm";
import { formatDate, formatTime } from "@/lib/utils/date";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId;
  // Extraemos el clientId de los params si existe en la URL para el botón de regreso
  const urlClientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId;

  const [event, setEvent] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    eventDate: "",
    eventTime: "",
    location: "",
    notes: "",
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ¡Adiós Emojis! Textos limpios y en español
  const eventFields: Field[] = [
    { name: "name", label: "Nombre del Evento" },
    { name: "eventDate", label: "Fecha del Evento", type: "date" },
    { name: "eventTime", label: "Hora del Evento", type: "time" },
    { name: "location", label: "Ubicación" },
    { name: "notes", label: "Notas", type: "textarea" },
  ];

  const fetchContract = async () => {
    try {
      const res = await fetch(`/api/company/contracts?eventId=${eventId}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const result = await res.json();
      setContract(result.data[0] || null);
    } catch { }
  };

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/company/events/${eventId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setError("Error al cargar el evento.");
        return;
      }

      const data = await res.json();
      setEvent({
        ...data,
        deletedAt: data.deletedAt ?? data.deleted,
        clientName: data.client?.name,
      });

      const iso = new Date(data.eventDate);
      const datePart = iso.toISOString().slice(0, 10);
      const timePart = iso.toISOString().slice(11, 16);

      setForm({
        name: data.name ?? "",
        eventDate: datePart,
        eventTime: timePart,
        location: data.location ?? "",
        notes: data.notes ?? "",
      });
    } catch {
      setError("Error de conexión al cargar el evento.");
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async () => {
    try {
      setSaving(true);
      const dateTime = new Date(`${form.eventDate}T${form.eventTime}`);
      const pad = (n: number) => String(n).padStart(2, "0");
      const formatted = `${dateTime.getFullYear()}-${pad(dateTime.getMonth() + 1)}-${pad(
        dateTime.getDate()
      )} ${pad(dateTime.getHours())}:${pad(dateTime.getMinutes())}:00`;

      const payload = {
        name: form.name,
        eventDate: formatted,
        location: form.location,
        notes: form.notes,
      };

      await fetch(`/api/company/events/${eventId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await fetchEvent();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) return;

    await fetch(`/api/company/events/${eventId}`, {
      method: "DELETE",
      credentials: "include",
    });
    
    const targetClientId = urlClientId || event?.client?.id;
    if (targetClientId) {
      router.push(`/company/clients/${targetClientId}/events`);
    } else {
      router.push("/company/events");
    }
  };

  const reactivateEvent = async () => {
    try {
      const res = await fetch(`/api/company/events/${eventId}?reactivate=true`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) {
        setError("Error al reactivar el evento.");
        return;
      }
      await fetchEvent();
    } catch {
      setError("Error de conexión.");
    }
  };

  const handleCreateContract = async () => {
    try {
      const res = await fetch("/api/company/contracts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: Number(eventId),
          status: "draft",
          totalAmount: 0,
        }),
      });

      if (!res.ok) {
        setError("Error al generar el contrato.");
        return;
      }

      const newContract = await res.json();
      router.push(`/company/contracts/${newContract.id}`);
    } catch {
      setError("Error de conexión al crear el contrato.");
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchContract();
  }, []);

  const formattedEvent = event
    ? {
        ...event,
        eventDate: formatDate(event.eventDate),
        eventTime: formatTime(event.eventDate),
      }
    : null;

  // Ruta de regreso dinámica
  const backHref = urlClientId || event?.client?.id 
    ? `/company/clients/${urlClientId || event?.client?.id}/events` 
    : "/company/events";

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-10">
      
      {/* 1. NAVEGACIÓN Y CABECERA */}
      <div className="flex flex-col gap-1.5 mb-2">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 bg-transparent hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            title="Volver a los eventos"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight m-0">
            Detalles del Evento
          </h1>
        </div>
        
        {event?.client && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 ml-12">
            <User size={15} />
            Cliente: <Link href={`/company/clients/${event.client.id}`} className="text-gray-700 hover:underline">{event.client.name}</Link>
          </div>
        )}
      </div>

      {error && <ErrorBox message={error} />}

      {/* 2. SKELETON LOADER */}
      {loading && (
        <div className="animate-pulse flex flex-col gap-6">
          <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm w-full flex flex-col gap-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="flex flex-col gap-0 bg-gray-50 rounded-xl border border-gray-100 p-1">
              <div className="h-14 border-b border-gray-100"></div>
              <div className="h-14 border-b border-gray-100"></div>
              <div className="h-14 border-b border-gray-100"></div>
              <div className="h-14"></div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTENIDO PRINCIPAL */}
      {!loading && event && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* BANNER DEL CONTRATO */}
          {contract ? (
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100/50 text-blue-700 rounded-lg">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Contrato #{contract.id}
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">
                    ESTADO: {contract.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/company/contracts/${contract.id}`)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                Ver Contrato
              </button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-gray-200 text-gray-400 rounded-lg">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    Este evento aún no tiene un contrato vinculado.
                  </span>
                </div>
              </div>
              <button
                onClick={handleCreateContract}
                className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 shrink-0"
              >
                <Plus size={16} />
                Generar Contrato
              </button>
            </div>
          )}

          {/* TARJETA DE DETALLES DEL EVENTO */}
          <DetailCard
            title={event.name || "Evento sin nombre"}
            fields={eventFields}
            data={formattedEvent}
            form={form}
            setForm={setForm}
            editing={editing}
            setEditing={setEditing}
            saving={saving}
            onSave={updateEvent}
            onDelete={deleteEvent}
            actions={[
              ...(event.deletedAt
                ? [{ label: "Reactivar", onClick: reactivateEvent, icon: RefreshCcw }]
                : []),
            ]}
          />
        </div>
      )}
    </div>
  );
}