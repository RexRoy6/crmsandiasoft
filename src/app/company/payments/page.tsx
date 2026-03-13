"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import ErrorBox from "@/app/components/ErrorBox";

export default function PaymentsPage() {

  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")
  const [errorCode, setErrorCode] = useState<number>()

   const [showForm, setShowForm] = useState(false);

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

  useEffect(() => {
    fetchPayments()
  }, [])

  return (

    <div>

      <PageHeader
        title="Company Payments"
         buttonLabel="+ New payment"
                onClick={() => setShowForm(true)}
      />

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
              key={payment.id}
              title={`Payment #${payment.id}`}
              extra={[
                `Client: ${payment.clientName}`,
                `Event: ${payment.eventName}`,
                `Contract: #${payment.contractId}`,
                `Amount: $${payment.amount}`,
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