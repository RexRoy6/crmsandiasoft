"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";
import type { Field } from "@/app/components/crm/CreateForm";
import ClientSelector
  from "@/app/components/crm/clients/ClientSelector";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/components/crm/SearchBar";
import Pagination from "@/app/components/crm/Pagination";
import { formatDate, formatTime } from "@/lib/utils/date";


export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);


  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [createdContractId, setCreatedContractId] = useState<number | null>(
    null,
  );


  //para buscar clientes
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);


  const [form, setForm] = useState({
    clientId: "",
    client: undefined as
      | {
        id: number;
        name: string;
        phone: string;
      }
      | undefined,
    name: "",
    eventDate: "",
    eventTime: "",
    location: "",
    notes: "",
  });


  //funcion para limpiar form
  const resetForm = () => {
    setForm({
      clientId: "",
      client: undefined,
      name: "",
      eventDate: "",
      eventTime: "",
      location: "",
      notes: "",
    });
  };


  //es para redirigir a la creacion de contrato
  const router = useRouter();

  const eventFields: Field[] = [
    {
      name: "clientId",
      label: "Client",
      readOnly: true,
      after: (
        <ClientSelector
          selected={form.client}
          onSelect={(client) => {
            setForm((prev) => ({
              ...prev,
              clientId: String(client.id),
              client: {
                id: client.id,
                name: client.name,
                phone: client.phone,
              },
            }));
          }}
          onClear={() => {
            setForm((prev) => ({
              ...prev,
              clientId: "",
              client: undefined,
            }));
          }}
        />
      ),
    },

    { name: "name", label: "Event Name" },

    {
      name: "eventDate",
      label: "Event Date",
      type: "date",
      after: (
        <p
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          {form.eventDate
            ? `📅 Fecha seleccionada: ${formatDate(form.eventDate)}`
            : "📅 Selecciona una fecha"}
        </p>
      ),
    },
    { name: "eventTime", label: "Event Time", type: "time" },
    { name: "location", label: "Location" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/company/events?search=${search}&page=${page}&limit=8`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        setError("Failed to fetch events");
        setErrorCode(res.status);
        return;
      }

      const result = await res.json();

      setEvents(result.data);
      setPagination(result.pagination);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      setError("");
      setErrorCode(undefined);

      const dateTime = new Date(`${form.eventDate}T${form.eventTime}`);

      const pad = (n: number) => String(n).padStart(2, "0");

      const formatted = `${dateTime.getFullYear()}-${pad(
        dateTime.getMonth() + 1,
      )}-${pad(dateTime.getDate())} ${pad(dateTime.getHours())}:${pad(
        dateTime.getMinutes(),
      )}:00`;

      const payload = {
        clientId: Number(form.clientId),
        name: form.name,
        eventDate: formatted, // aquí va todo junto date + hora
        location: form.location,
        notes: form.notes,
      };

      const res = await fetch("/api/company/events", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError("Failed to create event");
        setErrorCode(res.status);
        return;
      }

      //setShowForm(false);
      const newEvent = await res.json();

      // es para crear contrato
      const contractRes = await fetch("/api/company/contracts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: Number(newEvent.id),
          status: "draft",
          totalAmount: 0,
        }),
      });

      if (!contractRes.ok) {
        setError("Event created, but failed to create contract");
        return;
      }

      const newContract = await contractRes.json();
      // es para crear contrato

      //aqui se redirige al cx a la pagina de contratos
      //router.push(`/company/contracts/${newContract.id}/services`);
      setCreatedContractId(newContract.id);
      setShowForm(false);
      //aqui se redirige al cx a la pagina de contratos

      setForm({

        clientId: "",
        client: undefined as
          | {
            id: number;
            name: string;
            phone: string;
          }
          | undefined,
        name: "",
        eventDate: "",
        eventTime: "",
        location: "",
        notes: "",
      });

      //fetchEvents();
    } catch {
      setError("Connection error");
    }
  };

  // fetch events con search + pagination
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, page]);

  return (
    <div>
      <PageHeader
        title="Events"
        buttonLabel="+ New Event"
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search events, clients or location"
      />

      {showForm && (
        <CreateForm
          title="Create Event"
          fields={eventFields}
          form={form}
          setForm={setForm}
          onSubmit={createEvent}
          onCancel={() => {
            resetForm();
            setShowForm(false);
          }}
        />
      )}

      {createdContractId && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            border: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
          }}
        >
          <p style={{ marginBottom: 10 }}>✔ Event created</p>
          <p style={{ marginBottom: 16 }}>✔ Contract created</p>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() =>
                router.push(`/company/contracts/${createdContractId}/services`)
              }
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              Add services now
            </button>

            <button
              onClick={() => {
                setCreatedContractId(null);
                fetchEvents();
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Go back to events
            </button>
          </div>
        </div>
      )}

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && <p>Loading events...</p>}

      {!loading && events.length === 0 && <p>No events found.</p>}

      {!loading && events.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {events.map((event) => {
              const date = new Date(event.eventDate);
              const contract = event.contract;
              //console.log("pagination:", pagination)
              return (
                <ListCard
                  key={event.id}
                  title={event.name}
                  subtitle={event.client?.name}
                  content={
                    <>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          marginTop: 6,
                        }}
                      >
                        {/* Date */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Date
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "var(--text-primary)",
                            }}
                          >
                            {formatDate(event.eventDate)} · {formatTime(event.eventDate)}
                          </span>
                        </div>

                        {/* Location */}
                        {event.location && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--text-secondary)",
                              }}
                            >
                              Location
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                color: "var(--text-primary)",
                              }}
                            >
                              {event.location}
                            </span>
                          </div>
                        )}

                        {/* Notes */}
                        {event.notes && (
                          <div
                            style={{
                              marginTop: 4,
                              padding: "8px 10px",
                              background: "var(--bg-secondary)",
                              borderRadius: 8,
                              border: "1px solid var(--bg-secondary)",
                              fontSize: 12,
                              color: "var(--text-primary)",
                            }}
                          >
                            {event.notes}
                          </div>
                        )}
                      </div>
                    </>
                  }
                  actions={[
                    ...(contract
                      ? [
                        {
                          label: "View Contract",
                          onClick: () =>
                            router.push(
                              `/company/contracts/${contract.id}/services`,
                            ),
                        },
                      ]
                      : [
                        // {
                        //   label: "Create Contract",
                        //   onClick: () => createContractForEvent(event.id),
                        // },
                      ]),

                    {
                      label: "Manage →",
                      onClick: () =>
                        router.push(
                          `/company/clients/${event.client?.id}/events/${event.id}`,
                        ),
                    },
                  ]}
                />
              );
            })}
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
