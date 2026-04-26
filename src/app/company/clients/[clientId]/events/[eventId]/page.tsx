"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DetailCard from "@/app/components/crm/DetailCard";
import ErrorBox from "@/app/components/ErrorBox";
import type { Field } from "@/app/components/crm/CreateForm";
import { formatDate, formatTime } from "@/lib/utils/date";

export default function EventDetailPage() {

    const params = useParams();
    const router = useRouter();


    const eventId = Array.isArray(params.eventId)
        ? params.eventId[0]
        : params.eventId;


    const [event, setEvent] = useState<any>(null);

    const [form, setForm] = useState({
        name: "",
        eventDate: "",
        eventTime: "",
        location: "",
        notes: "",
    });

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const eventFields: Field[] = [
        { name: "name", label: "Name" },

        { name: "eventDate", label: "📅 Event Date", type: "date" },
        { name: "eventTime", label: "🕒 Event Time", type: "time" },

        { name: "location", label: "📍 Location" },
        { name: "notes", label: "📝 Notes" }
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

            setEvent({
                ...data,
                deletedAt: data.deletedAt ?? data.deleted,
                clientName: data.client?.name
            });

            const iso = new Date(data.eventDate);

            const datePart = iso.toISOString().slice(0, 10);
            const timePart = iso.toISOString().slice(11, 16);

            setForm({
                name: data.name ?? "",
                eventDate: datePart,
                eventTime: timePart,
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

            // const res = await fetch(`/api/company/events/${eventId}`, {
            //     method: "PATCH",
            //     credentials: "include",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(form),
            // });


            // const data = await res.json()
            const dateTime = new Date(`${form.eventDate}T${form.eventTime}`);
            const pad = (n: number) => String(n).padStart(2, "0");

            const formatted = `${dateTime.getFullYear()}-${pad(
                dateTime.getMonth() + 1
            )}-${pad(dateTime.getDate())} ${pad(dateTime.getHours())}:${pad(
                dateTime.getMinutes()
            )}:00`;


            const payload = {
                name: form.name,
                eventDate: formatted,
                location: form.location,
                notes: form.notes,
            };

            const res = await fetch(`/api/company/events/${eventId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });



            await fetchEvent();

            setEditing(false);

        } finally {
            setSaving(false);
        }
    };

    const deleteEvent = async () => {



        if (!confirm("Delete this event?")) return;

        const res = await fetch(`/api/company/events/${eventId}`, {
            method: "DELETE",
            credentials: "include",
        });



        const data = await res.json()



        const clientId = event?.client?.id

        router.push(`/company/clients/${clientId}/events`);
    };

    const reactivateEvent = async () => {
        try {

            const res = await fetch(
                `/api/company/events/${eventId}?reactivate=true`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            )

            if (!res.ok) {
                setError("Failed to reactivate event")
                return
            }

            await fetchEvent()

        } catch {
            setError("Connection error")
        }
    }


    useEffect(() => {
        fetchEvent();
    }, []);


    //
    const formattedEvent = event
        ? {
            ...event,
            eventDate: formatDate(event.eventDate),
            eventTime: formatTime(event.eventDate),
        }
        : null;
    //

    return (
        <div>

            <h1>Event Details</h1>
            {event?.client && (
                <p>
                    <strong>Client:</strong> {event.client.name}
                </p>
            )}

            {error && <ErrorBox message={error} />}

            {loading && <p>Loading...</p>}

            {event && (
                <DetailCard
                    title={event.name}
                    fields={eventFields}
                    data={formattedEvent}
                    form={form}
                    setForm={setForm}
                    editing={editing}
                    setEditing={setEditing}
                    saving={saving}
                    onSave={updateEvent}
                    onDelete={deleteEvent}
                    actions={[
                        ...(event.deletedAt
                            ? [{ label: "Reactivate", onClick: reactivateEvent }]
                            : []),
                    ]}
                />
            )}

        </div>


    );
}