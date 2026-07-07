"use client";

import { useEffect, useState } from "react";
import CreateForm from "@/app/components/crm/CreateForm";
import Toast from "@/app/components/Toast";
import PaymentList from "@/app/components/crm/payments/PaymentList";
import PaymentForm from "@/app/components/crm/payments/PaymentForm";
import EventSearch from "@/app/components/crm/events/EventSearch";
import ContractServiceForm from "@/app/components/crm/contracts/ContractServiceForm";
import ContractServicesList from "@/app/components/crm/contracts/ContractServicesList";
import ContractSummaryCard from "@/app/components/crm/contracts/ContractSummaryCard";

import { resumeContractDraft } from "@/services/contracts/resumeContractDraft";
import { getEventFields } from "@/app/components/crm/events/getEventFields";
import { useEventForm } from "@/app/hooks/events/useEventForm";
import { useContract } from "@/app/hooks/contracts/useContract";

// Íconos actualizados de Lucide
import { Info, AlertCircle, FilePlus, ChevronRight, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function NewContractPage() {
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();

  const parseError = (error: any, fallback = "Error inesperado") => {
    if (!error) return fallback;
    if (typeof error === "string") return error;
    if (Array.isArray(error)) return error.join(", ");
    if (typeof error === "object") {
      if (error.fieldErrors) {
        const messages = Object.values(error.fieldErrors).flat().filter(Boolean);
        if (messages.length) return messages.join(", ");
      }
      if (error.message) return String(error.message);
    }
    return fallback;
  };

  // Servicios
  const [services, setServices] = useState<any[]>([]);
  const [companyServices, setCompanyServices] = useState<any[]>([]);

  // Flujo Actualizado a 4 estados
  const [step, setStep] = useState<"event" | "services" | "payments" | "success">("event");

  // Pagos
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Contrato
  const [contractId, setContractId] = useState<number | null>(null);
  const { contract, setContract, fetchContract } = useContract(contractId);

  const {
    form,
    setForm,
    resetForm,
    createEvent,
    error: eventError,
    errorCode: eventErrorCode,
  } = useEventForm({
    onSuccess: ({ event, contract }) => {
      setContract(contract);
      setContractId(contract.id);
      setEventDateTime(event.eventDate);
      setStep("services");
    },
  });

  const [eventDateTime, setEventDateTime] = useState<string | null>(null);

  const resetAll = () => {
    setStep("event");
    setContractId(null);
    setContract(null);
    localStorage.removeItem("activeContractDraft");
    resetForm();
    setServices([]);
    setCompanyServices([]);
    setPayments([]);
    setError("");
    setEventDateTime(null);
  };

  const fetchServices = async () => {
    if (!contractId) return;
    try {
      const res = await fetch(`/api/company/contracts/${contractId}/services`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setServices(data);
    } catch {
      setError("Error al cargar los servicios");
    }
  };

  const fetchCompanyServices = async () => {
    try {
      const res = await fetch("/api/company/services/active", {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setCompanyServices(data);
    } catch {
      setError("Error al cargar el catálogo de servicios");
    }
  };

  const fetchPayments = async () => {
    if (!contractId) return;
    try {
      setLoadingPayments(true);
      const res = await fetch(`/api/company/contracts/${contractId}/payments`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setPayments(data.payments);
    } catch {
      setError("Error al cargar los pagos");
    } finally {
      setLoadingPayments(false);
    }
  };

  const continueExistingEvent = async (event: any) => {
    try {
      const result = await resumeContractDraft(event.id);
      setContractId(result.contract.id);
      setContract(result.contract);
      setEventDateTime(event.eventDate);
      setStep("services");
    } catch (e: any) {
      setError(e.message || "Error de conexión");
    }
  };

  useEffect(() => {
    if (!contractId || !contract) return;
    if (contract.status !== "draft") {
      localStorage.removeItem("activeContractDraft");
      return;
    }
    localStorage.setItem("activeContractDraft", String(contractId));
  }, [contractId, contract]);

  useEffect(() => {
    const saved = localStorage.getItem("activeContractDraft");
    if (!saved) return;

    const restore = async () => {
      try {
        const res = await fetch(`/api/company/contracts/${saved}`, {
          credentials: "include",
        });
        const contract = await res.json();
        if (contract.status !== "draft") {
          localStorage.removeItem("activeContractDraft");
          return;
        }
        setContractId(contract.id);
        setContract(contract);
        setEventDateTime(contract.event?.eventDate || null);
        setStep("services");
        setError("");
      } catch (e) {
        console.error(e);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    if ((step === "services" || step === "payments") && contractId) {
      fetchServices();
      fetchCompanyServices();
      fetchContract();
      fetchPayments();
    }
  }, [step, contractId]);

  const fields = getEventFields({ form, setForm });

  return (
    <div className="w-full">
      {/* TÍTULO Y STEPPER */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-4 flex items-center gap-2">
          Registro Rápido
          {(step === "services" || step === "payments") && (
            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-md border border-gray-200 shadow-sm ml-2">
              Borrador guardado
            </span>
          )}
        </h2>
        
        {/* Stepper Visual de 3 Pasos */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm font-medium">
          <span className={`${step === "event" ? "text-gray-900 font-bold" : "text-gray-400"} transition-colors`}>
            1. Evento
          </span>
          <ChevronRight size={16} className="text-gray-300" />
          <span className={`${step === "services" ? "text-gray-900 font-bold" : "text-gray-400"} transition-colors`}>
            2. Servicios
          </span>
          <ChevronRight size={16} className="text-gray-300" />
          <span className={`${step === "payments" ? "text-gray-900 font-bold" : "text-gray-400"} transition-colors`}>
            3. Pagos
          </span>
        </div>
      </div>

      {/* TOAST DE ERRORES */}
      {(error || eventError) && (
        <Toast message={(error || eventError) as string} onClose={() => setError("")} />
      )}

      {/* ---------------- PASO 1: EVENTO ---------------- */}
      {step === "event" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          <div className="mb-6 p-4 md:p-5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3 text-sm text-gray-600 leading-relaxed shadow-sm">
            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 font-semibold block mb-1">Formato de Fecha</strong>
              <p className="mb-1">Al crear el evento, ingresa las fechas en formato <strong>MM/DD/YYYY</strong>.</p>
              <p>Tras guardar, el sistema las adaptará y mostrará como <strong>DD/MM/YYYY</strong>.</p>
            </div>
          </div>

          <CreateForm
            title="Detalles del Evento"
            fields={fields}
            form={form}
            setForm={setForm}
            onSubmit={createEvent}
            onCancel={resetForm}
            submitLabel="Guardar y Continuar"
          />

          <div className="w-full h-px bg-gray-200 my-10" />

          <div className="p-6 md:p-8 border border-gray-200 bg-white rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-2">Continuar Evento Existente</h3>
            <p className="text-sm text-gray-500 mb-6">Busca un evento creado previamente (en borrador) para continuar con su flujo.</p>
            <EventSearch onSelect={continueExistingEvent} />
          </div>
        </div>
      )}

      {/* ---------------- PASOS 2 Y 3: PANEL DIVIDIDO CON STICKY SUMMARY ---------------- */}
      {(step === "services" || step === "payments") && contractId && (
        <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">          

          {/* COLUMNA DERECHA: Área de Trabajo */}
          <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
            
            {/* --- VISTA DE SERVICIOS (Pantalla Completa - Ticket Vivo) --- */}
            {step === "services" && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
                
                {/* BLOQUE A: Inyector de Servicios (Formulario Arriba) */}
                <div className="w-full">
                  <ContractServiceForm
                    companyServices={companyServices}
                    contract={contract}
                    onSubmit={async (data) => {
                      try {
                        const eventDate = contract?.event?.eventDate?.split("T")[0];
                        const operationStart = data.operationStart ? new Date(`${eventDate}T${data.operationStart}`).toISOString() : undefined;
                        const operationEnd = data.operationEnd ? new Date(`${eventDate}T${data.operationEnd}`).toISOString() : undefined;

                        const payload = {
                          serviceId: Number(data.serviceId),
                          quantity: Number(data.quantity),
                          unitPrice: Number(data.unitPrice),
                          serviceNotes: data.serviceNotes,
                          operationStart,
                          operationEnd,
                        };

                        const res = await fetch(`/api/company/contracts/${contractId}/services`, {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });

                        if (!res.ok) {
                          const result = await res.json();
                          setError(parseError(result?.error, "Error al agregar servicio"));
                          return false;
                        }

                        setError("");
                        await fetchServices();
                        await fetchContract();
                        return true;
                      } catch (e) {
                        setError("Error de conexión");
                        return false;
                      }
                    }}
                  />
                </div>

                {/* BLOQUE B: El Ticket Vivo (Resumen + Lista Abajo) */}
                <div className="w-full">
                  <ContractSummaryCard 
                    contract={contract}
                    services={services}
                    companyServices={companyServices}
                    loadingServices={false}
                    onDeleteService={async (id) => {
                      if (!confirm("¿Eliminar este servicio?")) return;
                      try {
                        const res = await fetch(`/api/company/contract-items/${id}`, { method: "DELETE", credentials: "include" });
                        if (!res.ok) {
                          const data = await res.json();
                          setError(parseError(data?.error, "Error al eliminar"));
                          return;
                        }
                        setError("");
                        await fetchServices();
                        await fetchContract();
                      } catch {
                        setError("Error de conexión");
                      }
                    }}
                    onUpdateService={async (id, data) => {
                      try {
                        const res = await fetch(`/api/company/contract-items/${id}`, {
                          method: "PATCH",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(data),
                        });
                        if (!res.ok) {
                          const result = await res.json();
                          setError(parseError(result?.error, "Error al actualizar"));
                          return;
                        }
                        setError("");
                        await fetchServices();
                        await fetchContract();
                      } catch {
                        setError("Error de conexión");
                      }
                    }}
                  />
                </div>

                {/* BOTÓN DE CONTINUAR */}
                <div className="w-full flex justify-end mt-2 mb-10">
                  <button
                    onClick={() => setStep("payments")}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Confirmar y Proceder a Pagos
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* --- VISTA DE PAGOS --- */}
            {step === "payments" && (
              <div className="flex flex-col animate-in fade-in duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setStep("services")} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={18} />
                  </button>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight m-0">
                    3. Registro de Pagos
                  </h3>
                </div>

                <PaymentForm contractId={String(contractId)} onSuccess={fetchPayments} />

                <div className="mt-6">
                  {loadingPayments ? (
                    <p className="text-sm text-gray-500 animate-pulse">Cargando historial de pagos...</p>
                  ) : (
                    <PaymentList payments={payments} />
                  )}
                </div>

                <div className="mt-10 p-5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col gap-2 text-sm text-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold mb-1">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                    Finalizar Proceso
                  </div>
                  <p>Al registrar el pago inicial, este borrador pasará a ser un contrato activo en el sistema. Asegúrate de que todos los servicios estén correctamente asignados.</p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setStep("success")}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                  >
                    <CheckCircle2 size={16} />
                    Completar Registro
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- PASO 4: ÉXITO ---------------- */}
      {step === "success" && (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-2xl shadow-sm animate-in fade-in zoom-in-95 duration-500 text-center max-w-2xl mx-auto mt-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">¡Registro Completado!</h2>
          <p className="text-gray-500 mb-8 max-w-md">El contrato ha sido inicializado correctamente en el sistema. Ya puedes gestionar su logística desde el panel principal.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
             <button
              onClick={resetAll}
              className="flex justify-center items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-sm"
            >
              <FilePlus size={18} />
              Crear Nuevo Registro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}