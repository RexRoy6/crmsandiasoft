"use client";

import { useEffect, useState } from "react";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import PaymentAllocationCard from "@/app/components/crm/payments/PaymentAllocationCard";
import ErrorBox from "@/app/components/ErrorBox";
import ContractSearch from "@/app/components/crm/ContractSearch";
import { Plus, AlertCircle } from "lucide-react";
import { useContractItems } from "@/app/hooks/useContractItems";
import { parseLocalDate } from "@/lib/utils/date";

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
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Bloquear el scroll del fondo cuando el modal de pago está abierto
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

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

  const renderFieldError = (fieldName: string) => {
    if (!fieldErrors[fieldName] || fieldErrors[fieldName].length === 0) return undefined;
    return (
      <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
        <AlertCircle size={14} /> {fieldErrors[fieldName].join(", ")}
      </span>
    );
  };

  /* ---------- Campos Dinámicos ---------- */
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
      after: renderFieldError("currency"),
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
      after: renderFieldError("paymentMethod"),
    },
    {
      name: "paidAt",
      label: "Fecha de Pago",
      type: "date",
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
      after: renderFieldError("ticketNumber"),
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
    setFieldErrors({});
    setSubmitAttempted(false);
  }

  async function handleSubmit() {
    setSubmitAttempted(true);
    setError("");
    setFieldErrors({});

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
        paidAt: form.paidAt
  ? parseLocalDate(form.paidAt).toISOString()
  : undefined,
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
        
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
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
    <>
      {/* Botón renderizado de forma transparente para adaptarse a PageHeader o vistas hijas */}
      <button
        onClick={openForm}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shrink-0"
      >
        <Plus size={18} />
        Registrar Pago
      </button>

      {/* Modal Flotante Responsivo */}
      {show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white p-5 md:p-8 rounded-2xl shadow-xl w-full max-w-2xl my-8 flex flex-col gap-5 animate-in zoom-in-95 duration-200 border border-gray-100 relative">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600 font-semibold">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {fieldErrors.items && (
              <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-600 font-bold rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> El desglose de montos tiene inconsistencias: {fieldErrors.items.join(", ")}
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

            {error && errorCode && Object.keys(fieldErrors).length === 0 && (
              <div className="mt-2">
                <ErrorBox message={error} code={errorCode} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}