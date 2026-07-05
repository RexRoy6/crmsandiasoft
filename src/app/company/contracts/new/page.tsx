"use client";

import { useEffect, useState } from "react";
import CreateForm from "@/app/components/crm/CreateForm";
import Toast from "@/app/components/Toast"; // Reemplazamos ErrorBox por Toast
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

// Íconos para la nueva interfaz corporativa
import { Info, AlertCircle, RotateCcw, ChevronRight } from "lucide-react";

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

  // Flujo
  const [step, setStep] = useState<"event" | "services">("event");

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
    if (step === "services" && contractId) {
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
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-4">
          Registro Rápido
        </h2>
        <div className="flex items-center gap-2 md:gap-4 text-sm font-medium">
          <span className={`${step === "event" ? "text-gray-900" : "text-gray-400"} transition-colors`}>
            1. Detalles del Evento
          </span>
          <ChevronRight size={16} className="text-gray-300" />
          <span className={`${step === "services" ? "text-gray-900" : "text-gray-400"} transition-colors`}>
            2. Servicios y Pagos
          </span>
        </div>
      </div>

      {/* TOAST DE ERRORES */}
      {(error || eventError) && (
        <Toast 
          message={(error || eventError) as string} 
          onClose={() => setError("")} 
        />
      )}

      {/* ---------------- PASO 1: EVENTO ---------------- */}
      {step === "event" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          
          {/* Callout Informativo de Fecha */}
          <div className="mb-6 p-4 md:p-5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3 text-sm text-gray-600 leading-relaxed shadow-sm">
            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 font-semibold block mb-1">Formato de Fecha</strong>
              <p className="mb-1">
                Al crear el evento, ingresa las fechas en formato <strong>MM/DD/YYYY</strong> (Mes/Día/Año).
              </p>
              <p>
                Tras guardar, el sistema las adaptará y mostrará como <strong>DD/MM/YYYY</strong> (Día/Mes/Año). Ejemplo: <em>05/24/2026 se mostrará como 24/05/2026</em>.
              </p>
            </div>
          </div>

          <CreateForm
            title="1. Crear Nuevo Evento"
            fields={fields}
            form={form}
            setForm={setForm}
            onSubmit={createEvent}
            onCancel={resetForm}
          />

          <div className="w-full h-px bg-gray-200 my-10" />

          {/* Continuar Evento Existente */}
          <div className="p-6 md:p-8 border border-gray-200 bg-white rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-2">
              Continuar Evento Existente
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Busca un evento creado previamente para continuar con su flujo de contrato.
            </p>
            <EventSearch onSelect={continueExistingEvent} />
          </div>
        </div>
      )}

      {/* ---------------- PASO 2: SERVICIOS Y PAGOS ---------------- */}
      {step === "services" && contractId && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
          
          <ContractSummaryCard contract={contract} />
          
          <div className="p-6 md:p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-6">
              2. Asignación de Servicios
            </h3>

            <ContractServiceForm
              companyServices={companyServices}
              contract={contract}
              onSubmit={async (data) => {
                try {
                  const eventDate = contract?.event?.eventDate?.split("T")[0];
                  const operationStart = data.operationStart
                    ? new Date(`${eventDate}T${data.operationStart}`).toISOString()
                    : undefined;
                  const operationEnd = data.operationEnd
                    ? new Date(`${eventDate}T${data.operationEnd}`).toISOString()
                    : undefined;

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

            <div className="mt-8">
              <ContractServicesList
                services={services}
                loading={false}
                onDelete={async (id) => {
                  if (!confirm("¿Eliminar este servicio?")) return;
                  try {
                    const res = await fetch(`/api/company/contract-items/${id}`, {
                      method: "DELETE",
                      credentials: "include",
                    });

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
                onUpdate={async (id, data) => {
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

            <div className="w-full h-px bg-gray-100 my-10" />

            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-6">
              3. Registro de Pagos
            </h3>

            <PaymentForm contractId={String(contractId)} onSuccess={fetchPayments} />

            <div className="mt-6">
              {loadingPayments ? (
                <p className="text-sm text-gray-500 animate-pulse">Cargando historial de pagos...</p>
              ) : (
                <PaymentList payments={payments} />
              )}
            </div>
            
            {/* Callout Final (Reemplazo de los emojis) */}
            <div className="mt-10 p-5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col gap-2 text-sm text-gray-700 shadow-sm">
              <div className="flex items-center gap-2 text-gray-900 font-semibold mb-1">
                <AlertCircle className="w-5 h-5 text-gray-500" />
                Información del Registro
              </div>
              <p>Al registrar un pago, el contrato se considerará automáticamente como <strong>iniciado</strong>. Este es el paso final del flujo de registro rápido.</p>
              <p className="text-gray-500 mt-2">
                Si deseas iniciar un nuevo registro desde cero, puedes actualizar la página o utilizar el botón inferior.
              </p>
            </div>

            <button
              onClick={resetAll}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              <RotateCcw className="w-4 h-4" />
              Nuevo Registro
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
}