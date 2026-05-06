"use client";

import { useEffect, useState } from "react";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import PaymentAllocationCard from "@/app/components/crm/payments/PaymentAllocationCard";
import ErrorBox from "@/app/components/ErrorBox";
import ContractSearch from "@/app/components/crm/ContractSearch";

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

  const { contractItems, fetchContractItems } =
    useContractItems(activeContractId);

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

  /* ---------- fields dinámicos ---------- */

  const fields: Field[] = [
    ...(isGlobal
      ? [
        {
          name: "contractId",
          label: "Contract",
          readOnly: true,
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
      label: "Currency",
      type: "select",
      options: [
        { label: "MXN", value: "MXN" },
        { label: "USD", value: "USD" },
      ],
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      options: [
        { label: "Cash", value: "cash" },
        { label: "Transfer", value: "transfer" },
        { label: "Card", value: "card" },
      ],
    },
    {
      name: "paidAt",
      label: "Payment Date",
      type: "datetime-local",
    },
    {
      name: "ticketNumber",
      label: "Ticket Number",
    }
  ];

  /* ---------- lifecycle ---------- */

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

  /* ---------- actions ---------- */

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
        setError("Select a contract");
        return;
      }

      const total = form.items.reduce(
        (sum, i) => sum + i.amount,
        0
      );

      if (total <= 0) {
        setError("Enter at least one amount");
        return;
      }

      const res = await fetch(
        `/api/company/contracts/${activeContractId}/payments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currency: form.currency,
            paymentMethod: form.paymentMethod,
            // paidAt: form.paidAt || undefined,
            paidAt: form.paidAt
  ? new Date(form.paidAt).toISOString()
  : undefined,
            ticketNumber: form.ticketNumber || undefined,
            items: form.items.filter((i) => i.amount > 0),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();

        setError(data.error || "Failed to create payment");
        setErrorCode(res.status);
        return;
      }

      closeForm();

      onSuccess?.();
    } catch {
      setError("Connection error");
    }
  }

  /* ---------- UI ---------- */

  return (
    <>
      <button
        onClick={openForm}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          background: "#22c55e",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        + Add Payment
      </button>

      {show && (
        <>
          <CreateForm
            title="Add Payment"
            fields={fields}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />

          {contractItems.length > 0 && (
            <PaymentAllocationCard
              items={contractItems}
              formItems={form.items}
              setForm={setForm}
            />
          )}
        </>
      )}

      {error && <ErrorBox message={error} code={errorCode} />}
    </>
  );
}