"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";
import type { Field } from "@/app/components/crm/CreateForm";
import InlineClientForm from "@/app/components/crm/InlineClientForm";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/components/crm/SearchBar"
import Pagination from "@/app/components/crm/Pagination"

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [clientError, setClientError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [createdContractId, setCreatedContractId] = useState<number | null>(
    null,
  );

  const [contracts, setContracts] = useState<any[]>([]);


  //para buscar clientes
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  //

  //es para crear un nuevo cliente
  const [showClientForm, setShowClientForm] = useState(false);

  const [form, setForm] = useState({
    clientId: "",
    name: "",
    eventDate: "",
    eventTime: "",
    location: "",
    notes: "",
  });
  //form para nuevo cx
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  //es para redirigir a la creacion de contrato
  const router = useRouter();

  //fucion para crear un cx

  const createClientInline = async () => {
    try {
      if (!clientForm.name || !clientForm.phone || !clientForm.email) {
        setClientError("All client fields are required");
        return;
      }

      const res = await fetch("/api/company/clients", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientForm),
      });

      if (!res.ok) {
        setClientError("Failed to create client");
        return;
      }

      setClientError("");

      const newClient = await res.json();

      // 🔥 clave: actualizar lista
      setClients((prev) => [...prev, newClient]);

      // 🔥 seleccionar automáticamente
      setForm((prev) => ({
        ...prev,
        clientId: String(newClient.id),
      }));

      setShowClientForm(false);

      setClientForm({
        name: "",
        phone: "",
        email: "",
      });
    } catch {
      setError("Connection error");
    }
  };

  const eventFields: Field[] = [
    {
      name: "clientId",
      label: "Client",
      type: "select",
      options: clients.map((client) => ({
        value: client.id,
        label: client.name,
      })),

      after: (
        <div style={{ marginTop: 6 }}>
          {!showClientForm && (
            <button
              onClick={() => setShowClientForm(true)}
              style={{
                padding: "4px 8px",
                fontSize: 12,
                borderRadius: 6,
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              + Create new client
            </button>
          )}

          {showClientForm && (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                background: "var(--bg-secondary)",
              }}
            >
              {showClientForm && (
                <>
                  <InlineClientForm
                    form={clientForm}
                    setForm={setClientForm}
                    onSubmit={createClientInline}
                    onCancel={() => setShowClientForm(false)}
                  />

                  {clientError && (
                    <div style={{ marginTop: 8 }}>
                      <ErrorBox message={clientError} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ),
    },

    { name: "name", label: "Event Name" },
    { name: "eventDate", label: "Event Date", type: "date" },
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
        }
      )

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
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/company/clients", {
        credentials: "include",
      });

      if (!res.ok) return;


      const result = await res.json();
      /* quitar clientes eliminados */

      const activeClients = result.data.filter((c: any) => !c.deletedAt);

      setClients(activeClients);


    } catch { }
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

  //consultar contracts
  const fetchContracts = async () => {
    try {
      const res = await fetch("/api/company/contracts", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) return;

      const result = await res.json();
      setContracts(result.data);

    } catch { }
  };
  const getContractForEvent = (eventId: number) => {
    return contracts.find((c) => c.event?.id === eventId);
  };

  const createContractForEvent = async (eventId: number) => {
    try {
      const res = await fetch("/api/company/contracts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          status: "draft",
          totalAmount: 0,
        }),
      });

     if (!res.ok) {
  const data = await res.json()

  setError(data?.error || "Failed to create contract")
  setErrorCode(res.status)
  return
}

      const newContract = await res.json();

      router.push(`/company/contracts/${newContract.id}/services`);
    } catch {
      setError("Connection error");
    }
  };

  // fetch inicial (clients + contracts)
  useEffect(() => {
    fetchClients();
    fetchContracts();
  }, []);

  // fetch events con search + pagination
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvents()
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, page])

  return (
    <div>
      <PageHeader
        title="Events"
        buttonLabel="+ New Event"
        onClick={() => setShowForm(true)}
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
          onCancel={() => setShowForm(false)}
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
              const contract = getContractForEvent(event.id);
              //console.log("pagination:", pagination)
              return (
                <div
                  key={event.id}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: 10,
                    padding: 12,
                    background: "var(--bg-primary)",
                  }}
                >
                  <ListCard
                    title={event.name}
                    extra={[
                      `Client: ${event.client?.name}`,
                      `Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}`,
                      `Location: ${event.location}`,
                      `Notes: ${event.notes} `,
                    ]}
                    link={`/company/clients/${event.client?.id}/events/${event.id}`}
                  />


                  {/* 👇 AQUÍ VA TU BOTÓN */}
                  <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                    {contract ? (
                      <>
                        <button
                          onClick={() =>
                            router.push(
                              `/company/contracts/${contract.id}/services`,
                            )
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "none",
                            background: "#16a34a",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          View Contract
                        </button>

                        <span
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                          }}
                        >
                          Status: {contract.status}
                        </span>
                      </>
                    ) : (
                      <button
                        onClick={() => createContractForEvent(event.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid var(--border-color)",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        Create Contract
                      </button>
                    )}
                  </div>
                </div>
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
