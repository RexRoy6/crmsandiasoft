"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";
import ErrorBox from "@/app/components/ErrorBox";
import type { Field } from "@/app/components/crm/CreateForm";
import { formatDate, formatTime } from "@/lib/utils/date";
export default function ClientEventsPage() {
  const params = useParams();
  const clientId = params.clientId;

  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number>();
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    eventDate: "",
    location: "",
    notes: "",
  });

  const eventFields: Field[] = [
    { name: "name", label: "Event name" },
    { name: "eventDate", label: "Event date", type: "date" },
    { name: "location", label: "Location" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/company/events?clientId=${clientId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to fetch events");
        setErrorCode(res.status);
        return;
      }

      const result = await res.json();

      setEvents(result.data);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      const payload = {
        ...form,
        clientId: Number(clientId),
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
      {!loading && events.length === 0 && <p>No events yet.</p>}
      {!loading && events.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {events.map((event) => (
            <ListCard
              key={event.id}
              title={event.name}
              subtitle={`📅 ${formatDate(event.eventDate)} · ${formatTime(event.eventDate)}`}
              content={
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span>📍 {event.location}</span>
                  {event.notes && <span>📝 {event.notes}</span>}
                </div>
              }
              link={`/company/clients/${clientId}/events/${event.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
