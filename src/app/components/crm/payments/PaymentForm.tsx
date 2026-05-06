"use client";

import { useState } from "react";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import PaymentAllocationCard from "@/app/components/crm/payments/PaymentAllocationCard";
import ErrorBox from "@/app/components/ErrorBox";

import { useContractItems } from "@/app/hooks/useContractItems";

export default function PaymentForm({
  contractId,
  onSuccess,
}: {
  contractId: string;
  onSuccess?: () => void;
}) {
  const { contractItems, fetchContractItems } =
    useContractItems(contractId);

  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    currency: "MXN",
    paymentMethod: "cash",
    items: [] as {
      contractItemId: number;
      amount: number;
    }[],
  });

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number>();

  const fields: Field[] = [
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
  ];

  async function openForm() {
    setShow(true);

    const items = await fetchContractItems();

    setForm((prev) => ({
      ...prev,
      items,
    }));
  }

  function closeForm() {
    setShow(false);

    setForm({
      currency: "MXN",
      paymentMethod: "cash",
      items: [],
    });

    setError("");
  }

  async function handleSubmit() {
    try {
      const total = form.items.reduce(
        (sum, i) => sum + i.amount,
        0
      );

      if (total <= 0) {
        setError("Enter at least one amount");
        return;
      }

      const res = await fetch(
        `/api/company/contracts/${contractId}/payments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currency: form.currency,
            paymentMethod: form.paymentMethod,
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

      onSuccess?.(); // 🔥 refresca lista desde afuera
    } catch {
      setError("Connection error");
    }
  }

  return (
    <>
      {/* botón */}
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

      {/* form */}
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