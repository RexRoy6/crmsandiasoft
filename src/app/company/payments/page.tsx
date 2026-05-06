"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import ErrorBox from "@/app/components/ErrorBox";
import CreateForm from "@/app/components/crm/CreateForm";
import type { Field } from "@/app/components/crm/CreateForm";
import SearchBar from "@/app/components/crm/SearchBar";
import PaymentAllocationCard from "@/app/components/payments/PaymentAllocationCard";
import Pagination from "@/app/components/crm/Pagination";
import ContractSearch from "@/app/components/crm/ContractSearch";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number>();

  const [showForm, setShowForm] = useState(false);
  // const [form, setForm] = useState({
  //   contractId: "",
  //   currency: "MXN",
  //   paymentMethod: "cash",
  //   items: [] as {
  //     contractItemId: number;
  //     amount: number;
  //   }[],
  // });

  const [form, setForm] = useState<PaymentForm>({
    contractId: "",
    currency: "MXN",
    paymentMethod: "cash",
    items: [],
  });

  //buscar info de los servicios de contrato
  const [contractItems, setContractItems] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [contracts, setContracts] = useState<any[]>([]);
  const availableContracts = contracts.filter((c) => c.remainingAmount > 0);

  //esto es para el search y pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  type PaymentForm = {
    contractId: string;
    currency: string;
    paymentMethod: string;
    items: {
      contractItemId: number;
      amount: number;
    }[];
    contract?: {
      id: number;
      clientName: string;
      eventName: string;
      remainingAmount: number;
    };
  };


  const paymentFields: Field[] = [
    {
      name: "contractId",
      label: "Contract",
      readOnly: true,
      after: (
        <>
          {form.contractId && form.contract && (
            <div style={{ fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>
                ✅ #{form.contract.id} · {form.contract.clientName}
              </div>

              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {form.contract.eventName}
              </div>

              <div style={{ fontSize: 12 }}>
                💰 Remaining: ${form.contract.remainingAmount}
              </div>
            </div>
          )}

          <ContractSearch
            selected={form.contractId}
            onSelect={(c: any) => {
              setForm((prev: any) => ({
                ...prev,
                contractId: String(c.id),
                contract: {
                  id: c.id,
                  clientName: c.client?.name,
                  eventName: c.event?.name,
                  remainingAmount: c.remainingAmount,
                },
              }));
            }}
          />

          {form.contractId && (
            <button
              onClick={() =>
                setForm((prev: any) => ({
                  ...prev,
                  contractId: "",
                  contract: undefined,
                }))
              }
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#dc2626",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              Change contract
            </button>
          )}

        </>
      ),
    },
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
        `/api/company/payments?search=${search}&page=${page}&limit=4`,
        { credentials: "include" },
      );

      if (!res.ok) {
        setError("Failed to fetch payments");
        setErrorCode(res.status);
        return;
      }

      const result = await res.json();

      setPayments(result.data);
      setPagination(result.pagination);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchContracts() {
    try {
      // const res = await fetch(
      //   "/api/company/contracts",

      //   { credentials: "include" }
      // )
      const res = await fetch("/api/company/contracts?limit=1000", {
        credentials: "include",
      });
      if (!res.ok) return;

      const data = await res.json();

      setContracts(data.data);
    } catch { }
  }

  async function fetchContractItems(contractId: string) {
    const res = await fetch(`/api/company/contracts/${contractId}/services`, {
      credentials: "include",
    });

    const data = await res.json();

    setContractItems(data);

    // inicializar items en form
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

      const res = await fetch(
        `/api/company/contracts/${form.contractId}/payments`,
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
        },
      );

      if (!res.ok) {
        const data = await res.json();

        setError(data?.error || "Failed to create payment");
        setErrorCode(res.status);
        return;
      }

      setShowForm(false);

      setForm({
        contractId: "",
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
    const timeout = setTimeout(() => {
      fetchPayments();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, page]);

  useEffect(() => {
    if (form.contractId) {
      fetchContractItems(form.contractId);
    }
  }, [form.contractId]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Company Payments"
        buttonLabel="+ New payment"
        onClick={() => {
          setShowForm(true);
          fetchContracts();
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

      {showForm && (
        <CreateForm
          title="Create Payment"
          fields={paymentFields}
          form={form}
          setForm={setForm}
          onSubmit={createPayment}
          onCancel={() => {
            setShowForm(false);
            setForm({
              contractId: "",
              currency: "MXN",
              paymentMethod: "cash",
              items: [],
            });
            setContractItems([]);
          }}
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

      {loading && <p>Loading payments...</p>}

      {!loading && payments.length === 0 && <p>No payments found.</p>}

      {!loading && payments.length > 0 && (
        <>
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
                title={`Payment #${payment.id} (${payment.eventName})`}
                subtitle={`Contract #${payment.contract.id} • Client: ${payment.clientName}`}
                badge={{ label: payment.summary.paymentStatus }}
                content={
                  <div>
                    {payment.items.map((item: any) => (
                      <div
                        key={`p${payment.id}-ci${item.contractItemId}-a${item.amount}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "var(--bg-secondary)",
                          borderRadius: 10,
                        }}
                      >
                        {/* Left: info */}
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {item.service.name}
                          </span>

                          {item.service.description && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--text-primary)",
                              }}
                            >
                              {item.service.description}
                            </span>
                          )}
                        </div>

                        {/* Right: amount */}
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          ${item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                }
                link={`/company/contracts/${payment.contract.id}/payments`}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      background: "var(--bg-primary)",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--bg-secundary)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginTop: 6,
                      }}
                    >
                      {/* Method */}
                      <div
                        style={{
                          fontSize: 12,
                          color: "#2563eb",
                          fontWeight: 500,
                          background: "#eff6ff",
                          padding: "4px 8px",
                          borderRadius: 6,
                          width: "fit-content",
                        }}
                      >
                        Method: {payment.paymentMethod}
                      </div>

                      {/* Amount */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                        }}
                      >
                        <span style={{ color: "var(--text-secondary)" }}>
                          Amount
                        </span>
                        <span
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          ${payment.amount}
                        </span>
                      </div>

                      {/* Contract Total */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                        }}
                      >
                        <span style={{ color: "var(--text-secondary)" }}>
                          Contract Total
                        </span>
                        <span
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          ${payment.contract.total}
                        </span>
                      </div>

                      {/* Remaining */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          paddingTop: 6,
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        <span style={{ color: "var(--text-secondary)" }}>
                          Remaining
                        </span>
                        <span
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          ${payment.summary.remainingAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ListCard>
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
  );
}
