"use client";

import { useEffect, useState } from "react";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import PaymentAllocationCard from "@/app/components/crm/payments/PaymentAllocationCard";
import ErrorBox from "@/app/components/ErrorBox";
import ContractSearch from "@/app/components/crm/ContractSearch";
import { Plus, AlertCircle } from "lucide-react";
import { useContractItems } from "@/app/hooks/useContractItems";

export default function PaymentForm({
  contractId,
  onSuccess,
}: {
  contractId?: string;
  onSuccess?: () => void;
}) {
  const isGlobal = !contractId;
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const activeContractId = contractId || selectedContractId;

  const { contractItems, fetchContractItems } = useContractItems(activeContractId);
  const [show, setShow] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [form, setForm] = useState({
    currency: "MXN",
    paymentMethod: "cash",
    paidAt: "",
    ticketNumber: "",
    items: [] as {
      contractItemId: number;
      amount: number;
    }[],
  });

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number>();
  
  // 1. NUEVO ESTADO: Para capturar los errores específicos de campo enviados por Zod
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  /* ---------- Validaciones Locales (Frontend) ---------- */
  let dateError = "";
  if (submitAttempted) {
    if (!form.paidAt) {
      dateError = "La fecha de pago es obligatoria.";
    } else {
      const selectedDate = new Date(form.paidAt);
      const today = new Date();
      if (selectedDate > today) {
        dateError = "La fecha de pago no puede ser en el futuro.";
      }
    }
  }

  const hasExceededAmounts = contractItems.some((item, idx) => {
    const total = item.quantity * Number(item.unitPrice);
    const paid = item.paidAmount || 0;
    const remaining = item.remainingAmount ?? total - paid;
    const val = form.items[idx]?.amount || 0;
    return val > remaining || val < 0;
  });

  // Función ayudante para renderizar los errores que vengan del Backend (Zod)
  const renderFieldError = (fieldName: string) => {
    if (!fieldErrors[fieldName] || fieldErrors[fieldName].length === 0) return undefined;
    return (
      <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
        <AlertCircle size={14} /> {fieldErrors[fieldName].join(", ")}
      </span>
    );
  };

  /* ---------- Campos Dinámicos con Mapeo de Errores Inyectado ---------- */
  const fields: Field[] = [
    ...(isGlobal
      ? [
          {
            name: "contractId",
            label: "Contrato",
            readOnly: true,
            fullWidth: true,
            after: (
              <>
                <ContractSearch
                  selected={selectedContractId}
                  onSelect={(c: any) => setSelectedContractId(String(c.id))}
                />
                {renderFieldError("contractId")}
              </>
            ),
          },
        ]
      : []),

    {
      name: "currency",
      label: "Moneda",
      type: "select",
      options: [
        { label: "MXN", value: "MXN" },
        { label: "USD", value: "USD" },
      ],
      after: renderFieldError("currency"), // Mapea error de Zod si la moneda es inválida
    },
    {
      name: "paymentMethod",
      label: "Método de Pago",
      type: "select",
      options: [
        { label: "Efectivo", value: "cash" },
        { label: "Transferencia", value: "transfer" },
        { label: "Tarjeta", value: "card" },
      ],
      after: renderFieldError("paymentMethod"), // Mapea error de Zod si el método falla
    },
    {
      name: "paidAt",
      label: "Fecha de Pago",
      type: "date",
      // Combina el error local del frontend con el error que pueda mandar Zod del backend
      after: dateError || fieldErrors.paidAt ? (
        <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
          <AlertCircle size={14} /> 
          {dateError || fieldErrors.paidAt.join(", ")}
        </span>
      ) : undefined,
    },
    {
      name: "ticketNumber",
      label: "Número de Ticket",
      after: renderFieldError("ticketNumber"), // Mapea error si el formato del ticket no es válido
    },
  ];

  /* ---------- Ciclo de Vida ---------- */
  useEffect(() => {
    if (activeContractId) {
      fetchContractItems().then((items) => {
        if (items) {
          setForm((prev) => ({
            ...prev,
            items: items.map((i: any) => ({ contractItemId: i.id, amount: "" })),
          }));
        }
      });
    }
  }, [activeContractId]); 

  /* ---------- Acciones ---------- */
  async function openForm() {
    setShow(true);
    if (contractId) {
      const items = await fetchContractItems();
      setForm((prev) => ({
        ...prev,
        items: items.map((i: any) => ({ contractItemId: i.id, amount: 0 })),
      }));
    }
  }

  function closeForm() {
    setShow(false);
    setForm({
      currency: "MXN",
      paymentMethod: "cash",
      paidAt: "",
      ticketNumber: "",
      items: [],
    });
    setSelectedContractId("");
    setError("");
    setFieldErrors({}); // Limpiamos errores al cerrar
    setSubmitAttempted(false);
  }

  async function handleSubmit() {
    setSubmitAttempted(true);
    setError("");
    setFieldErrors({}); // Reseteamos los errores de campo en cada intento

    if (!activeContractId) {
      setError("Por favor, selecciona un contrato.");
      return;
    }

    if (!form.paidAt || dateError) {
      return; 
    }

    const total = form.items.reduce((sum, i) => sum + (i.amount || 0), 0);
    if (total <= 0) {
      setError("Debes ingresar al menos un monto de abono mayor a cero en el desglose.");
      return;
    }

    if (hasExceededAmounts) {
      setError("Por favor corrige los montos en rojo que superan el saldo restante.");
      return;
    }

    try {
      const payload = {
        currency: form.currency,
        paymentMethod: form.paymentMethod,
        paidAt: new Date(form.paidAt).toISOString(),
        ticketNumber: form.ticketNumber || undefined,
        items: form.items.filter((i) => i.amount > 0),
      };

      const res = await fetch(
        `/api/company/contracts/${activeContractId}/payments`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        
        // 2. DETECCIÓN INTELIGENTE DE ERRORES DE CAMPOS (ZOD)
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors); // Guardamos la lista de culpables
          setError("Revisa los campos marcados en rojo, los datos enviados no son válidos.");
        } else {
          setError(typeof data.error === "string" ? data.error : "Error al registrar el pago.");
        }

        setErrorCode(res.status);
        return;
      }

      closeForm();
      onSuccess?.();
    } catch {
      setError("Error de conexión con el servidor.");
    }
  }

  return (
    <div className="mb-6">
      {!show && (
        <button
          onClick={openForm}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Registrar Pago
        </button>
      )}

      {show && (
        <div className="mt-4 bg-gray-50/50 p-1 md:p-4 rounded-2xl border border-gray-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ease-out">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600 font-semibold animate-in slide-in-from-top-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Si el error general de Zod dice algo de "items", lo pintamos arriba del desglose */}
          {fieldErrors.items && (
            <div className="p-2.5 bg-red-50 border border-red-100 text-xs text-red-600 font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
              <AlertCircle size={14} /> El desglose de montos tiene inconsistencias: {fieldErrors.items.join(", ")}
            </div>
          )}

          {contractItems.length > 0 && (
            <PaymentAllocationCard
              items={contractItems}
              formItems={form.items}
              setForm={setForm}
            />
          )}
          
          <CreateForm
            title="Detalles del Pago"
            fields={fields}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </div>
      )}

      {error && errorCode && Object.keys(fieldErrors).length === 0 && (
        <div className="mt-4">
          <ErrorBox message={error} code={errorCode} />
        </div>
      )}
    </div>
  );
}