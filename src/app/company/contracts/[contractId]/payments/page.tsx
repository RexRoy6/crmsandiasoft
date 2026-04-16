"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import ErrorBox from "@/app/components/ErrorBox";
import PaymentAllocationCard from "@/app/components/crm/PaymentAllocationCard";
import { useRouter } from "next/navigation";

export default function ContractPaymentsPage() {
  const params = useParams();
  const contractId = params.contractId;

  const [payments, setPayments] = useState<any[]>([]);

  const [contractTotal, setContractTotal] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number>();

  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    currency: "MXN",
    paymentMethod: "cash",
    items: [] as {
      contractItemId: number;
      amount: number;
    }[],
  });
  const [contractItems, setContractItems] = useState<any[]>([]);

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

  async function fetchPayments() {
    try {
      setLoading(true);

      const res = await fetch(`/api/company/contracts/${contractId}/payments`, {
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to fetch payments");
        setErrorCode(res.status);
        return;
      }

      const data = await res.json();

      setPayments(data.payments);
      setContractTotal(data.contractTotal);
      setPaidAmount(data.paidAmount);
      setRemainingAmount(data.remainingAmount);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }
  async function fetchContractItems() {
    const res = await fetch(`/api/company/contracts/${contractId}/services`, {
      credentials: "include",
    });

    const data = await res.json();

    setContractItems(data);

    setForm((prev) => ({
      ...prev,
      items: data.map((item: any) => ({
        contractItemId: item.id,
        amount: 0,
      })),
    }));
  }

  async function createPayment() {
    try {
      const total = form.items.reduce((sum, i) => sum + i.amount, 0);

      if (total <= 0) {
        setError("Enter at least one amount");
        return;
      }

      const res = await fetch(`/api/company/contracts/${contractId}/payments`, {
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
      });

      if (!res.ok) {
        const data = await res.json();

        setError(JSON.stringify(data.error) || "Failed to create payment");

        setErrorCode(res.status);

        return;
      }

      setShowForm(false);

      setForm({
        currency: "MXN",
        paymentMethod: "cash",
        items: [],
      });

      setContractItems([]);

      fetchPayments();
    } catch {
      setError("Connection error");
    }
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  const progress = contractTotal > 0 ? (paidAmount / contractTotal) * 100 : 0;

  return (
    <div>
      <PageHeader
        title={`Contract ${contractId} Payments`}
        buttonLabel="+ Add Payment"
        onClick={() => {
          setShowForm(true);
          fetchContractItems(); // importante
        }}
      />

      {/* ---------- CONTRACT SUMMARY ---------- */}

      <div
        style={{
          background: "var(--bg-primary)",
          padding: 20,
          borderRadius: 12,
          border: "1px solid var(--border-color)",
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 500,
        }}
      >
        <strong>Contract Summary</strong>

        <div>
          <span style={{ color: "var(--text-secondary)" }}>Total:</span> $
          {contractTotal}
        </div>

        <div>
          <span style={{ color: "var(--text-secondary)" }}>Paid:</span> $
          {paidAmount}
        </div>

        <div>
          <span style={{ color: "var(--text-secondary)" }}>Remaining:</span> $
          {remainingAmount}
        </div>

        {/* ---------- PAYMENT PROGRESS ---------- */}

        <div
          style={{
            marginTop: 10,
            height: 8,
            borderRadius: 6,
            background: "var(--bg-secondary)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              background: "#22c55e",
              height: "100%",
            }}
          />
        </div>

        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          {progress.toFixed(0)}% paid
        </span>
      </div>

      {showForm && (
        <CreateForm
          title="Add Payment"
          fields={fields}
          form={form}
          setForm={setForm}
          onSubmit={createPayment}
          onCancel={() => setShowForm(false)}
        />
      )}
      {showForm && contractItems.length > 0 && (
        <PaymentAllocationCard
          items={contractItems}
          formItems={form.items}
          setForm={setForm}
        />
      )}
      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && (
        <p style={{ color: "var(--text-secondary)" }}>Loading payments...</p>
      )}

      {!loading && payments.length === 0 && (
        <p style={{ color: "var(--text-secondary)" }}>No payments yet.</p>
      )}

      {!loading && payments.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {payments.map((payment) => (
            <ListCard
              key={payment.id}
              title={`Payment #${payment.id}`}
              content={
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {payment.items.map((item: any) => (
                    <div
                      key={`p${payment.id}-c${payment.contractId}-i${item.contractItemId}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "var(--bg-secondary)",
                        padding: "8px 10px",
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {item.service.name} (
                          {item.service.description && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--text-secondary)",
                              }}
                            >
                              {item.service.description}
                            </span>
                          )}
                          )
                        </span>
                      </div>

                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        ${item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              }
              // actions={[
              //   {
              //     label: "Manage →",
              //     onClick: () => router.push(``),
              //   },
              // ]}
              link="#"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 8,
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              >
                <span>
                  <strong>Currency:</strong> ${payment.currency}
                </span>
                <span>
                  <strong>Amount:</strong> ${payment.amount}
                </span>
                <span>
                  <strong>Method:</strong> {payment.paymentMethod}
                </span>
                <span>
                  <strong>Date:</strong>{" "}
                  {new Date(payment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </ListCard>
          ))}
        </div>
      )}
    </div>
  );
}
