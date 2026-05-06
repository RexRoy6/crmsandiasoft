"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import ErrorBox from "@/app/components/ErrorBox";
import PaymentAllocationCard from "@/app/components/crm/payments/PaymentAllocationCard";

import ContractSummary from "@/app/components/crm/payments/ContractSummary";
import PaymentList from "@/app/components/crm/payments/PaymentList";

import { useContractPayments } from "@/app/hooks/useContractPayments";
import { useContractItems } from "@/app/hooks/useContractItems";

export default function ContractPaymentsPage() {
  const params = useParams();
  const contractId = params.contractId as string;

  // hooks (toda la lógica vive aquí ahora)
  const {
    payments,
    contractTotal,
    paidAmount,
    remainingAmount,
    loading,
    error,
    errorCode,
    fetchPayments,
  } = useContractPayments(contractId);

  const {
    contractItems,
    fetchContractItems,
  } = useContractItems(contractId);

  // UI state
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    currency: "MXN",
    paymentMethod: "cash",
    items: [] as {
      contractItemId: number;
      amount: number;
    }[],
  });

  const [localError, setLocalError] = useState("");
  const [localErrorCode, setLocalErrorCode] = useState<number>();

  // form config
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

  async function handleOpenForm() {
    setShowForm(true);

    const items = await fetchContractItems();

    setForm((prev) => ({
      ...prev,
      items,
    }));
  }

  async function createPayment() {
    try {
      const total = form.items.reduce((sum, i) => sum + i.amount, 0);

      if (total <= 0) {
        setLocalError("Enter at least one amount");
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

        setLocalError(data.error || "Failed to create payment");
        setLocalErrorCode(res.status);
        return;
      }

      // reset
      setShowForm(false);

      setForm({
        currency: "MXN",
        paymentMethod: "cash",
        items: [],
      });

      // refresh data
      fetchPayments();
    } catch {
      setLocalError("Connection error");
    }
  }

  return (
    <div>
      <PageHeader
        title={`Contract ${contractId} Payments`}
        buttonLabel="+ Add Payment"
        onClick={handleOpenForm}
      />

      {/* ✅ separado */}
      <ContractSummary
        total={contractTotal}
        paid={paidAmount}
        remaining={remainingAmount}
      />

      {/* form */}
      {showForm && (
        <>
          <CreateForm
            title="Add Payment"
            fields={fields}
            form={form}
            setForm={setForm}
            onSubmit={createPayment}
            onCancel={() => setShowForm(false)}
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

      {/* errores */}
      {(error || localError) && (
        <ErrorBox
          message={error || localError}
          code={errorCode || localErrorCode}
        />
      )}

      {/* lista */}
      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>
          Loading payments...
        </p>
      ) : (
        <PaymentList payments={payments} />
      )}
    </div>
  );
}