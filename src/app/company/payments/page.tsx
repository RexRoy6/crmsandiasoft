"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import ErrorBox from "@/app/components/ErrorBox";
import CreateForm from "@/app/components/crm/CreateForm";
import type { Field } from "@/app/components/crm/CreateForm";

export default function PaymentsPage() {

  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")
  const [errorCode, setErrorCode] = useState<number>()

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
  contractId: "",
  amount: "",
  currency: "MXN",
  paymentMethod: "cash"
});

const [contracts, setContracts] = useState<any[]>([])

const paymentFields: Field[] = [
  {
    name: "contractId",
    label: "Contract",
    type: "select",
    options: contracts.map((c) => ({
      label: `#${c.id} - ${c.client.name} (${c.event.name})`,
      value: c.id
    }))
  },

  {
    name: "amount",
    label: "Amount",
    type: "number"
  },

  {
    name: "currency",
    label: "Currency",
    type: "select",
    options: [
      { label: "MXN", value: "MXN" },
      { label: "USD", value: "USD" }
    ]
  },

  {
    name: "paymentMethod",
    label: "Payment Method",
    type: "select",
    options: [
      { label: "Cash", value: "cash" },
      { label: "Transfer", value: "transfer" },
      { label: "Card", value: "card" }
    ]
  }
]




  async function fetchPayments() {

    try {

      const res = await fetch(
        "/api/company/payments",
        { credentials: "include" }
      )

      if (!res.ok) {
        setError("Failed to fetch payments")
        setErrorCode(res.status)
        return
      }

      const data = await res.json()

      setPayments(data)

    } catch {

      setError("Connection error")

    } finally {

      setLoading(false)

    }

  }

  async function fetchContracts() {

  try {

    const res = await fetch(
      "/api/company/contracts",
      { credentials: "include" }
    )

    if (!res.ok) return

    const data = await res.json()

    setContracts(data)

  } catch {}

}

  async function createPayment() {

  try {

    const res = await fetch(
      `/api/company/contracts/${form.contractId}/payments`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Number(form.amount),
          currency: form.currency,
          paymentMethod: form.paymentMethod
        })
      }
    )

    if (!res.ok) {

      const data = await res.json()

      setError(data?.error || "Failed to create payment")
      setErrorCode(res.status)
      return
    }

    setShowForm(false)

    setForm({
      contractId: "",
      amount: "",
      currency: "MXN",
      paymentMethod: "cash"
    })

    fetchPayments()

  } catch {

    setError("Connection error")

  }

}

  useEffect(() => {
    fetchPayments()
  }, [])

  return (

    <div>

      <PageHeader
  title="Company Payments"
  buttonLabel="+ New payment"
  onClick={() => {
    setShowForm(true)
    fetchContracts()
  }}
/>

      {showForm && (
  <CreateForm
    title="Create Payment"
    fields={paymentFields}
    form={form}
    setForm={setForm}
    onSubmit={createPayment}
    onCancel={() => setShowForm(false)}
  />
)}

      {error && (
        <ErrorBox
          message={error}
          code={errorCode}
        />
      )}

      {loading && <p>Loading payments...</p>}

      {!loading && payments.length === 0 && (
        <p>No payments found.</p>
      )}

      {!loading && payments.length > 0 && (

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >

          {payments.map((payment) => (

            <ListCard
              key={payment.paymentId}
              title={`Payment #${payment.paymentId}`}
              extra={[
                `Client: ${payment.clientName}`,
                `Event: ${payment.eventName}`,
                `Contract: #${payment.contractId}`,

                `Amount: $${payment.amount}`,
                `Contract Total: $${payment.contractTotal}`,
                `Remaining: $${payment.remainingAmount}`,

                `Status: ${payment.paymentStatus}`,
                `Method: ${payment.paymentMethod}`
              ]}
              link={'#'}
            />

          ))}

        </div>

      )}

    </div>

  )
}