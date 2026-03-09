"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DetailCard from "@/app/components/crm/DetailCard";
import ErrorBox from "@/app/components/ErrorBox";

export default function EventDetailPage() {

  const params = useParams();
  const router = useRouter();

  const eventId = params.eventId;

  const [event, setEvent] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    eventDate: "",
    location: "",
    notes: "",
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const eventFields = [
    { name: "name", label: "Name" },
    { name: "eventDate", label: "Event Date" },
    { name: "location", label: "Location" },
    { name: "notes", label: "Notes" },
  ];

  const fetchEvent = async () => {
    try {

      setLoading(true);

      const res = await fetch(`/api/company/events/${eventId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to fetch event");
        return;
      }

      const data = await res.json();

      setEvent(data);

      setForm({
        name: data.name ?? "",
        eventDate: data.eventDate ?? "",
        location: data.location ?? "",
        notes: data.notes ?? "",
      });

    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async () => {
    try {

      setSaving(true);

      await fetch(`/api/company/events/${eventId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      await fetchEvent();

      setEditing(false);

    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async () => {

    if (!confirm("Delete this event?")) return;

    await fetch(`/api/company/events/${eventId}`, {
      method: "DELETE",
      credentials: "include",
    });

    router.push(`/company/clients/${params.clientId}/events`);
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  return (
    <div>

      <h1>Event Details</h1>

      {error && <ErrorBox message={error} />}

      {loading && <p>Loading...</p>}

      {event && (
        <DetailCard
          title={event.name}
          fields={eventFields}
          data={event}
          form={form}
          setForm={setForm}
          editing={editing}
          setEditing={setEditing}
          saving={saving}
          onSave={updateEvent}
          onDelete={deleteEvent}
        />
      )}
      <button
  onClick={() =>
    router.push(`/company/clients/${params.clientId}/events`)
  }
>
  ← Back
</button>

    </div>


  );
}