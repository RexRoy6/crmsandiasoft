"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays, CheckCircle2 } from "lucide-react";

import ErrorBox from "@/app/components/ErrorBox";
import CreateForm from "@/app/components/crm/CreateForm";
import SearchBar from "@/app/components/crm/SearchBar";
import Pagination from "@/app/components/crm/Pagination";
import EventCard from "@/app/components/crm/events/EventCard";

import { useEventForm } from "@/app/hooks/events/useEventForm";
import { useEvents } from "@/app/hooks/events/useEvents";
import { getEventFields } from "@/app/components/crm/events/getEventFields";

export default function EventsPage() {
  const router = useRouter();

  /* ---------- FORM ---------- */
  const {
    form,
    setForm,
    showForm,
    setShowForm,
    createdContractId,
    setCreatedContractId,
    createEvent,
    resetForm,
    error,
    errorCode,
  } = useEventForm();

  /* ---------- EVENTS ---------- */
  const {
    events,
    loading,
    error: eventsError,
    errorCode: eventsErrorCode,
    search,
    setSearch,
    page,
    setPage,
    pagination,
    fetchEvents,
  } = useEvents();

  /* ---------- FIELDS ---------- */
  const eventFields = getEventFields({
    form,
    setForm,
  });

  // Bloquear scroll del fondo cuando hay un modal abierto
  useEffect(() => {
    if (showForm || createdContractId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showForm, createdContractId]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* ===================== HEADER & BÚSQUEDA ===================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight m-0">
          Eventos Globales
        </h1>
        
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shrink-0"
        >
          <Plus size={18} />
          Nuevo Evento
        </button>
      </div>

      <div className="w-full max-w-md">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar eventos, clientes o ubicaciones..."
        />
      </div>

      {/* ===================== ERRORES ===================== */}
      {eventsError && <ErrorBox message={eventsError} code={eventsErrorCode} />}
      {error && <ErrorBox message={error} code={errorCode} />}

      {/* ===================== MODAL DE CREACIÓN ===================== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg my-8 animate-in zoom-in-95 duration-200">
            {/* 
              Al envolver tu CreateForm en este contenedor, lo transformamos en un modal flotante. 
              Asumimos que CreateForm tiene su propio fondo blanco/tarjeta. 
            */}
            <CreateForm
              title="Registrar Evento"
              fields={eventFields}
              form={form}
              setForm={setForm}
              onSubmit={createEvent}
              onCancel={() => {
                resetForm();
                setShowForm(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ===================== MODAL DE ÉXITO (Contrato Creado) ===================== */}
      {createdContractId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={32} />
            </div>
            
            <div className="flex flex-col gap-1.5 mb-2">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">¡Evento Registrado!</h3>
              <p className="text-sm text-gray-500">
                El evento y su contrato base han sido creados exitosamente. ¿Deseas cotizar y agregar los servicios ahora?
              </p>
            </div>

            <div className="flex flex-col w-full gap-2.5 mt-2">
              <button
                onClick={() => router.push(`/company/contracts/${createdContractId}/services`)}
                className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shadow-sm"
              >
                Agregar Servicios Ahora
              </button>
              <button
                onClick={() => {
                  setCreatedContractId(null);
                  fetchEvents();
                }}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
              >
                Volver a la Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ESTADO DE CARGA ===================== */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl border border-gray-200 animate-pulse"></div>
          ))}
        </div>
      )}

      {/* ===================== ESTADO VACÍO ===================== */}
      {!loading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CalendarDays size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No hay eventos registrados</h3>
          <p className="text-sm text-gray-500 mb-6">No se encontraron eventos que coincidan con tu búsqueda.</p>
        </div>
      )}

      {/* ===================== LISTA DE EVENTOS (GRID) ===================== */}
      {!loading && events.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {pagination && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}