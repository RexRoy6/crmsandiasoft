"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import ListCard from "@/app/components/crm/ListCard";
import CreateForm from "@/app/components/crm/CreateForm";
import type { Field } from "@/app/components/crm/CreateForm";
import { CONTRACT_STATUS } from "@/db/schema";
import SearchBar from "@/app/components/crm/SearchBar";
import Pagination from "@/app/components/crm/Pagination";
import { useRouter } from "next/navigation";
import EventSearch from "@/app/components/crm/EventSearch";
import { formatDate } from "@/lib/utils/date";

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();

  /* create contract */
  const [showForm, setShowForm] = useState(false);
  type ContractForm = {
    eventId: string;
    status: string;
    event?: {
      name: string;
      clientName: string;
      date: string;
      location: string;
    };
  };

  const [form, setForm] = useState<ContractForm>({
    eventId: "",
    status: "draft",
    event: undefined,
  });
  //seach params y pagiantion
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const contractFields: Field[] = [
    {
      name: "eventId",
      label: "Event",
      readOnly: true,
      after: (
        <>
          {form.event && (
            <div
              style={{
                marginTop: 8,
                padding: 10,
                borderRadius: 10,
                background: "var(--bg-secondary)",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                ✅ {form.event.name} ({form.event.clientName})
              </div>

              <div
                style={{
                  fontSize: 13,
                  marginTop: 4,
                  color: "var(--text-secondary)",
                }}
              >
                📅 {formatDate(form.event.date)} · 📍 {form.event.location}
              </div>
            </div>
          )}

          <EventSearch
            onSelect={(event: any) => {
              setForm((prev: any) => ({
                ...prev,
                eventId: String(event.id),
                event: {
                  name: event.name,
                  clientName: event.client?.name,
                  date: event.eventDate,
                  location: event.location,
                },
              }));
            }}
          />


        </>
      ),
    },

    {
      name: "status",
      label: "Status",
      type: "select",
      options: CONTRACT_STATUS.map((status) => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      })),
    },
    //,

    // {
    //     name: "totalAmount",
    //     label: "Total Amount",
    //     type: "number",
    // },
  ];
  const fetchContracts = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/company/contracts?search=${search}&page=${page}&limit=6`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        setError("Failed to fetch contracts");
        setErrorCode(res.status);
        return;
      }

      const result = await res.json();

      setContracts(result.data);
      setPagination(result.pagination);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        "/api/company/events?limit=100", // opcional
        { credentials: "include" },
      );

      if (!res.ok) return;

      const result = await res.json();

      const activeEvents = result.data.filter(
        (e: any) => !e.deletedAt, //  mejor usar deletedAt
      );

      setEvents(activeEvents);
    } catch { }
  };

  const createContract = async () => {
    const payload = {
      eventId: Number(form.eventId),
      status: form.status,
      totalAmount: 0, //Number(form.totalAmount),
    };

    //console.log("Contract payload:", payload)

    try {
      const res = await fetch("/api/company/contracts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: Number(form.eventId),
          status: form.status,
          totalAmount: 0, //Number(form.totalAmount),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(JSON.stringify(data.error) || "Failed to create contract");
        setErrorCode(res.status);
        return;
      }

      setShowForm(false);

      setForm({
        eventId: "",
        status: "draft",
        //,
        //totalAmount: "",
      });

      fetchContracts();
    } catch {
      setError("Connection error");
    }
  };

  // fetch inicial (events)
  useEffect(() => {
    fetchEvents();
  }, []);

  // fetch contracts con search + pagination
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchContracts();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, page]);

  function getStatusColor(status: string) {
    switch (status) {
      case "draft":
        return "#6b7280"; // gray

      case "active":
        return "#2563eb"; // blue

      case "cancelled":
        return "#dc2626"; // red

      case "completed":
        return "#16a34a"; // green

      default:
        return "#6b7280";
    }
  }
  return (
    <div>
      <PageHeader
        title="Contracts"
        buttonLabel="+ New Contract"
        onClick={() => setShowForm(true)}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by status, client, event or location"
      />

      {showForm && (
        <CreateForm
          title="Create Contract"
          fields={contractFields}
          form={form}
          setForm={setForm}
          onSubmit={createContract}
          onCancel={() => {
            setShowForm(false);
            setForm({
              eventId: "",
              status: "draft",
            });
          }}
        />
      )}

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && <p>Loading contracts...</p>}

      {!loading && contracts.length === 0 && <p>No contracts found.</p>}

      {!loading && contracts.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {contracts.map((contract) => {
              const progress =
                contract.totalAmount > 0
                  ? (contract.paidAmount / contract.totalAmount) * 100
                  : 0;

              const statusColor = getStatusColor(contract.status);

              return (
                <ListCard
                  key={contract.id}
                  title={`Contract #${contract.id} (${contract.event?.name})`}
                  subtitle={`Client: ${contract.client?.name}`}
                  badge={{ label: contract.status }}
                  link={`/company/contracts/${contract.id}`}
                  actions={[
                    {
                      label: "Manage →",
                      onClick: () =>
                        router.push(`/company/contracts/${contract.id}`),
                    },
                  ]}
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
                        border: "1px solid var(--bg-secondary)",
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
                            ${contract.paidAmount}
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
                            Total
                          </span>
                          <span
                            style={{
                              color: "var(--text-primary)",
                              fontWeight: 600,
                            }}
                          >
                            ${contract.totalAmount}
                          </span>
                        </div>

                        {/* Remaining */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13,
                            paddingTop: 6,
                            borderTop: "1px solid var(--bg-secondary)",
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
                            ${contract.remainingAmount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* footer / children */}
                  <div
                    style={{
                      background: "#ebe5e5",
                      borderRadius: 6,
                      height: 8,
                      marginTop: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        background: statusColor,
                        height: "100%",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color: "#6b7280",
                    }}
                  >
                    {Math.round(progress)}% paid
                  </div>
                </ListCard>
              );
            })}
          </div>

          {/* 👇 PAGINATION */}
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
