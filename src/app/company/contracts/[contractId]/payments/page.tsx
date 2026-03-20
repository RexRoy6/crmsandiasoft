"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";
import ErrorBox from "@/app/components/ErrorBox";

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

  const [form, setForm] = useState({
    currency: "MXN",
    paymentMethod: "cash",
    items: [] as {
      contractItemId: number;
      amount: number;
    }[]
  });
  const [contractItems, setContractItems] = useState<any[]>([])


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

      const res = await fetch(
        `/api/company/contracts/${contractId}/payments`,
        { credentials: "include" }
      );

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
    const res = await fetch(
      `/api/company/contracts/${contractId}/services`,
      { credentials: "include" }
    )

    const data = await res.json()

    setContractItems(data)

    setForm(prev => ({
      ...prev,
      items: data.map((item: any) => ({
        contractItemId: item.id,
        amount: 0
      }))
    }))
  }

  async function createPayment() {

    try {

      const total = form.items.reduce(
        (sum, i) => sum + i.amount,
        0
      )

      if (total <= 0) {
        setError("Enter at least one amount")
        return
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
            items: form.items.filter(i => i.amount > 0)
          }),
        }
      );

      if (!res.ok) {

        const data = await res.json();

        setError(
          JSON.stringify(data.error) ||
          "Failed to create payment"
        );

        setErrorCode(res.status);

        return;

      }

      setShowForm(false);

      setForm({
        currency: "MXN",
        paymentMethod: "cash",
        items: []
      })

      setContractItems([])

      fetchPayments();

    } catch {

      setError("Connection error");

    }

  }

  useEffect(() => {
    fetchPayments();
  }, []);

  const progress =
    contractTotal > 0
      ? (paidAmount / contractTotal) * 100
      : 0;

  return (

    <div>

      <PageHeader
        title={`Contract ${contractId} Payments`}
        buttonLabel="+ Add Payment"
        onClick={() => {
          setShowForm(true)
          fetchContractItems() // importante
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
          <span style={{ color: "var(--text-secondary)" }}>
            Total:
          </span>{" "}
          ${contractTotal}
        </div>

        <div>
          <span style={{ color: "var(--text-secondary)" }}>
            Paid:
          </span>{" "}
          ${paidAmount}
        </div>

        <div>
          <span style={{ color: "var(--text-secondary)" }}>
            Remaining:
          </span>{" "}
          ${remainingAmount}
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

        <div style={{ marginTop: 20 }}>

          <h3>Allocate Payment</h3>

          {contractItems.map((item, index) => {

            const total =
              item.quantity * Number(item.unitPrice)

            return (
              <div key={item.id} style={{ marginBottom: 10 }}>

                <p>
                  Service #{item.serviceId} — Total: ${total}
                </p>

                <input
                  type="number"
                  placeholder="Amount"
                  value={form.items[index]?.amount || ""}
                  onChange={(e) => {

                    const value = Number(e.target.value)

                    setForm(prev => {
                      const updated = [...prev.items]

                      updated[index] = {
                        ...updated[index],
                        amount: value
                      }

                      return {
                        ...prev,
                        items: updated
                      }
                    })
                  }}
                />

              </div>
            )
          })}

          <p style={{ marginTop: 10 }}>
            Total Payment: $
            {form.items.reduce((sum, i) => sum + i.amount, 0)}
          </p>

        </div>
      )}
      {error && (
        <ErrorBox
          message={error}
          code={errorCode}
        />
      )}

      {loading && (
        <p style={{ color: "var(--text-secondary)" }}>
          Loading payments...
        </p>
      )}

      {!loading && payments.length === 0 && (
        <p style={{ color: "var(--text-secondary)" }}>
          No payments yet.
        </p>
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
              extra={[
                `Amount: $${payment.amount}`,
                `Currency: ${payment.currency}`,
                `Method: ${payment.paymentMethod}`,
                `Date: ${new Date(payment.createdAt).toLocaleDateString()}`,

                ...payment.items.map(
                  (item: any) =>
                    `• Service ${item.contractItemId}: $${item.amount}`
                )
              ]}
              link="#"
            />

          ))}

        </div>

      )}

    </div>

  );
}