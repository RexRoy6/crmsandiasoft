"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";
import type { Field } from "@/app/components/crm/CreateForm";

export default function EventsPage() {

  const [events, setEvents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  //es para crear un nuevo cliente
  const [showClientForm, setShowClientForm] = useState(false)


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
  })

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

      const res = await fetch("/api/company/events", {
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to fetch events");
        setErrorCode(res.status);
        return;
      }

      const data = await res.json();

      setEvents(data);

    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };
  const fetchClients = async () => {

    try {

      const res = await fetch(
        "/api/company/clients",
        { credentials: "include" }
      );

      if (!res.ok) return;

      const data = await res.json();

      /* quitar clientes eliminados */
      const activeClients = data.filter(
        (c: any) => !c.deletedAt
      );

      setClients(activeClients);

    } catch { }

  };


  const createEvent = async () => {
    try {

      setError("");
      setErrorCode(undefined);

      const payload = {
        ...form,
        clientId: Number(form.clientId),
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

      setShowForm(false);

      setForm({
        clientId: "",
        name: "",
        eventDate: "",
        eventTime: "",
        location: "",
        notes: "",
      });


      fetchEvents();

    } catch {
      setError("Connection error");
    }
  };

  //fucion para crear un cx

  const createClientInline = async () => {
    try {
      if (!clientForm.name || !clientForm.phone || !clientForm.email) {
        setError("All client fields are required")
        return
      }

      const res = await fetch("/api/company/clients", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientForm),
      })

      if (!res.ok) {
        setError("Failed to create client")
        return
      }

      const newClient = await res.json()

      // 🔥 clave: actualizar lista
      setClients((prev) => [...prev, newClient])

      // 🔥 seleccionar automáticamente
      setForm((prev) => ({
        ...prev,
        clientId: String(newClient.id),
      }))

      setShowClientForm(false)

      setClientForm({
        name: "",
        phone: "",
        email: "",
      })

    } catch {
      setError("Connection error")
    }
  }


  useEffect(() => {
    fetchEvents();
    fetchClients();
  }, []);

  return (
    <div>

      <PageHeader
        title="Events"
        buttonLabel="+ New Event"
        onClick={() => setShowForm(true)}
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

      {/* 👇 ESTE VA AFUERA */}
      {showClientForm && (
        <CreateForm
          title="Create Client"
          fields={[
            { name: "name", label: "Name" },
            { name: "phone", label: "Phone" },
            { name: "email", label: "Email" },
          ]}
          form={clientForm}
          setForm={setClientForm}
          onSubmit={createClientInline}
          onCancel={() => setShowClientForm(false)}
        />
      )}

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && <p>Loading events...</p>}

      {!loading && events.length === 0 && (
        <p>No events found.</p>
      )}

      {!loading && events.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {events.map((event) => {
            const date = new Date(event.eventDate); // 👈 aquí sí existe

            return (
              <ListCard
                key={event.id}
                title={event.name}
                extra={[
                  `Client: ${event.client?.name}`,
                  `Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`,
                  `Location: ${event.location}`,
                  `Notes: ${event.notes} `
                ]}
                link={`/company/clients/${event.client?.id}/events/${event.id}`}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}