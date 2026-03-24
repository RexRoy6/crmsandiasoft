"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import ErrorBox from "@/app/components/ErrorBox";
import CreateForm from "@/app/components/crm/CreateForm";
import type { Field } from "@/app/components/crm/CreateForm";
import SearchBar from "@/app/components/crm/SearchBar"
import PaymentAllocationCard from "@/app/components/crm/PaymentAllocationCard";
import Pagination from "@/app/components/crm/Pagination"


export default function PaymentsPage() {

  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")
  const [errorCode, setErrorCode] = useState<number>()

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    contractId: "",
    currency: "MXN",
    paymentMethod: "cash",
    items: [] as {
      contractItemId: number;
      amount: number;
    }[]
  });

  //buscar info de los servicios de contrato
  const [contractItems, setContractItems] = useState<any[]>([])


  const [search, setSearch] = useState("")

  const [contracts, setContracts] = useState<any[]>([])
  const availableContracts = contracts.filter(
    (c) => c.remainingAmount > 0
  )

  //esto es para el search y pagination
  const [page, setPage] = useState(1)
const [pagination, setPagination] = useState<any>(null)


  const paymentFields: Field[] = [
    {
      name: "contractId",
      label: "Contract",
      type: "select",
      options: availableContracts.map((c) => ({
        label: `#${c.id} - ${c.client.name} (${c.event.name}) - Remaining $${c.remainingAmount}`,
        value: c.id
      }))
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

    setLoading(true)

    const res = await fetch(
      `/api/company/payments?search=${search}&page=${page}&limit=4`,
      { credentials: "include" }
    )

    if (!res.ok) {
      setError("Failed to fetch payments")
      setErrorCode(res.status)
      return
    }

    const result = await res.json()

    setPayments(result.data)
    setPagination(result.pagination)

  } catch {
    setError("Connection error")
  } finally {
    setLoading(false)
  }
}

  async function fetchContracts() {

    try {

      // const res = await fetch(
      //   "/api/company/contracts",
        
      //   { credentials: "include" }
      // )
const res = await fetch("/api/company/contracts?limit=1000", { credentials: "include" })
      if (!res.ok) return

      const data = await res.json()

    setContracts(data.data)

    } catch { }

  }


  async function fetchContractItems(contractId: string) {

    const res = await fetch(
      `/api/company/contracts/${contractId}/services`,
      { credentials: "include" }
    )

    const data = await res.json()

    setContractItems(data)

    // inicializar items en form
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
        `/api/company/contracts/${form.contractId}/payments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            currency: form.currency,
            paymentMethod: form.paymentMethod,
            items: form.items.filter(i => i.amount > 0)
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
        currency: "MXN",
        paymentMethod: "cash",
        items: []
      })

      setContractItems([])

      fetchPayments()

    } catch {

      setError("Connection error")

    }

  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPayments()
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, page])

  useEffect(() => {
    if (form.contractId) {
      fetchContractItems(form.contractId)
    }
  }, [form.contractId])

  useEffect(() => {
    setPage(1)
  }, [search])

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

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by client or event"
      />
      <p style={{ fontSize: 12, color: "#6b7280" }}>
        {pagination?.total ?? 0} payments found
      </p>


      {showForm && (<CreateForm
        title="Create Payment"
        fields={paymentFields}
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
        <>

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
                `Contract: #${payment.contract.id}`,

                `Amount: $${payment.amount}`,
                `Contract Total: $${payment.contract.total}`,
                `Remaining: $${payment.summary.remainingAmount}`,

                `Status: ${payment.summary.paymentStatus}`,
                `Method: ${payment.paymentMethod}`,
                // ...payment.items.map(
                //   (item: any) =>
                //     `• Service ${item.contractItemId}: $${item.amount}`
                // )

                ...payment.items.flatMap((item: any) => [
                  `• ${item.service.name}: $${item.amount}`,
                  `  ${item.service.description}`
                ])
              ]}
              link={'#'}
            />

          ))}

        </div>

            {/* 👇 pagination SEPARADO */}
                  {pagination && (
                    <Pagination
                      page={page}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                    />
                  )}
                </>
        

      )}

    </div>

  )
}