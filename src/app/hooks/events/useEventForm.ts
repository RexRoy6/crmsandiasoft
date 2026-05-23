"use client";

import { useState } from "react";

export interface EventFormState {
  clientId: string;

  client:
    | {
        id: number;
        name: string;
        phone: string;
      }
    | undefined;

  name: string;
  eventDate: string;
  eventTime: string;
  location: string;
  notes: string;
}

const initialForm: EventFormState = {
  clientId: "",
  client: undefined,

  name: "",
  eventDate: "",
  eventTime: "",

  location: "",
  notes: "",
};

export function useEventForm() {
  const [form, setForm] =
    useState<EventFormState>(initialForm);

  const [showForm, setShowForm] =
    useState(false);

  const [createdContractId, setCreatedContractId] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  const [errorCode, setErrorCode] =
    useState<number | undefined>();

  /* ---------- RESET ---------- */

  const resetForm = () => {
    setForm(initialForm);
  };

  /* ---------- CREATE EVENT ---------- */

  const createEvent = async () => {
    try {
      setError("");
      setErrorCode(undefined);

      const dateTime = new Date(
        `${form.eventDate}T${form.eventTime}`
      );

      const pad = (n: number) =>
        String(n).padStart(2, "0");

      const formatted = `${dateTime.getFullYear()}-${pad(
        dateTime.getMonth() + 1
      )}-${pad(dateTime.getDate())} ${pad(
        dateTime.getHours()
      )}:${pad(dateTime.getMinutes())}:00`;

      /* ---------- CREATE EVENT ---------- */

      const payload = {
        clientId: Number(form.clientId),

        name: form.name,

        eventDate: formatted,

        location: form.location,

        notes: form.notes,
      };

      const res = await fetch(
        "/api/company/events",
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        setError("Failed to create event");
        setErrorCode(res.status);
        return null;
      }

      const newEvent = await res.json();

      /* ---------- CREATE CONTRACT ---------- */

      const contractRes = await fetch(
        "/api/company/contracts",
        {
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
        }
      );

      if (!contractRes.ok) {
        setError(
          "Event created, but failed to create contract"
        );

        return null;
      }

      const newContract =
        await contractRes.json();

      /* ---------- SUCCESS ---------- */

      setCreatedContractId(newContract.id);

      setShowForm(false);

      resetForm();

      return {
        event: newEvent,
        contract: newContract,
      };

    } catch {
      setError("Connection error");

      return null;
    }
  };

  return {
    form,
    setForm,

    showForm,
    setShowForm,

    createdContractId,
    setCreatedContractId,

    createEvent,
    resetForm,

    error,
    errorCode,

    setError,
    setErrorCode,
  };
}