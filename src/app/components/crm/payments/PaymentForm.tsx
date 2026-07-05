"use client";

import { useEffect, useState } from "react";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import PaymentAllocationCard from "@/app/components/crm/payments/PaymentAllocationCard";
import ErrorBox from "@/app/components/ErrorBox";
import ContractSearch from "@/app/components/crm/ContractSearch";
import { Plus } from "lucide-react";
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

  /* ---------- Campos Dinámicos (Traducidos y Estructurados) ---------- */
  const fields: Field[] = [
    ...(isGlobal
      ? [
          {
            name: "contractId",
            label: "Contrato",
            readOnly: true,
            fullWidth: true, // Aprovechamos la nueva cuadrícula inteligente
            after: (
              <ContractSearch
                selected={selectedContractId}
                onSelect={(c: any) => {
                  setSelectedContractId(String(c.id));
                }}
              />
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
    },
    {
      name: "paidAt",
      label: "Fecha de Pago",
      type: "date",
    },
    {
      name: "ticketNumber",
      label: "Número de Ticket",
    },
  ];

  /* ---------- Ciclo de Vida ---------- */
  useEffect(() => {
    if (selectedContractId) {
      fetchContractItems().then((items) => {
        setForm((prev) => ({
          ...prev,
          items,
        }));
      });
    }
  }, [selectedContractId]);

  /* ---------- Acciones ---------- */
  async function openForm() {
    setShow(true);
    if (contractId) {
      const items = await fetchContractItems();
      setForm((prev) => ({
        ...prev,
        items,
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
  }

  async function handleSubmit() {
    try {
      if (!activeContractId) {
        setError("Por favor, selecciona un contrato.");
        return;
      }

      const total = form.items.reduce((sum, i) => sum + i.amount, 0);

      if (total <= 0) {
        setError("Ingresa al menos un monto mayor a cero.");
        return;
      }

      const payload = {
        currency: form.currency,
        paymentMethod: form.paymentMethod,
        paidAt: form.paidAt ? new Date(form.paidAt).toISOString() : undefined,
        ticketNumber: form.ticketNumber || undefined,
        items: form.items.filter((i) => i.amount > 0),
      };

      const res = await fetch(
        `/api/company/contracts/${activeContractId}/payments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al registrar el pago.");
        setErrorCode(res.status);
        return;
      }

      closeForm();
      onSuccess?.();
    } catch {
      setError("Error de conexión con el servidor.");
    }
  }

  /* ---------- Interfaz (UI) ---------- */
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

      {error && <div className="mt-4"><ErrorBox message={error} code={errorCode} /></div>}
    </div>
  );
}