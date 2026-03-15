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

  const [form, setForm] = useState({
    clientId: "",
    name: "",
    eventDate: "",
    location: "",
    notes: "",
  });

const eventFields: Field[] = [
  {
    name: "clientId",
    label: "Client",
    type: "select",
    options: clients.map((client) => ({
      value: client.id,
      label: client.name,
    })),
  },
  { name: "name", label: "Event Name" },
  { name: "eventDate", label: "Event Date", type: "date" },
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

  } catch {}

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
        location: "",
        notes: "",
      });

      fetchEvents();

    } catch {
      setError("Connection error");
    }
  };

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
          {events.map((event) => (
            <ListCard
              key={event.id}
              title={event.name}
              extra={[
                `Client: ${event.client?.name}`,
                `Date: ${new Date(event.eventDate).toLocaleDateString()}`,
                `Location: ${event.location}`,
                 `Notes: ${event.notes} `
              ]}
              link={`/company/clients/${event.client?.id}/events/${event.id}`}
            />
          ))}
        </div>
      )}

    </div>
  );
}